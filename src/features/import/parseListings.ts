import { titleCase } from '../../lib/format'
import { type Listing, listingSchema } from './listingSchema'

type RawListing = Partial<Listing> & { rawText?: string }

const moneyPattern = /(?:[$€£]\s?(\d+(?:[,.]\d+)?)|(\d+(?:[,.]\d+)?)\s?(?:USD|EUR|GBP|RON))/i

export function parseListings(input: string): Listing[] {
  const trimmed = input.trim()
  if (!trimmed) return []

  const records = looksLikeCsv(trimmed) ? parseCsv(trimmed) : parseHtml(trimmed)
  return records
    .map((record, index) => normalizeListing(record, index))
    .filter((listing): listing is Listing => listing !== null)
}

function looksLikeCsv(value: string) {
  const firstLine = value.split(/\r?\n/, 1)[0] ?? ''
  return firstLine.includes(',') && /(price|title|bedroom|rating)/i.test(firstLine)
}

function parseCsv(value: string): RawListing[] {
  const rows = value
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean)
    .map(splitCsvRow)

  const headers = rows[0]?.map((header) => header.toLowerCase().trim()) ?? []

  return rows.slice(1).map((row) => {
    const record: Record<string, string> = {}
    headers.forEach((header, index) => {
      record[header] = row[index] ?? ''
    })
    return {
      title: valueFor(record, ['title', 'name', 'listing']),
      location: valueFor(record, ['location', 'city', 'market']),
      neighborhood: valueFor(record, ['neighborhood', 'district', 'area']),
      url: valueFor(record, ['url', 'link']),
      priceNightly: numberFor(valueFor(record, ['price', 'nightly_price', 'rate'])),
      cleaningFee: numberFor(valueFor(record, ['cleaning_fee', 'cleaning'])),
      bedrooms: numberFor(valueFor(record, ['bedrooms', 'beds'])),
      bathrooms: numberFor(valueFor(record, ['bathrooms', 'baths'])),
      guests: numberFor(valueFor(record, ['guests', 'capacity'])),
      rating: numberFor(valueFor(record, ['rating', 'stars'])),
      reviewCount: numberFor(valueFor(record, ['reviews', 'review_count'])),
      amenities: valueFor(record, ['amenities'])
        .split(/[;|]/)
        .map((item) => item.trim())
        .filter(Boolean),
      minNights: numberFor(valueFor(record, ['min_nights', 'minimum_nights'])),
      occupancyHint: numberFor(valueFor(record, ['occupancy', 'occupancy_hint'])),
      source: 'csv',
    }
  })
}

function splitCsvRow(row: string) {
  const cells: string[] = []
  let current = ''
  let quoted = false

  for (const char of row) {
    if (char === '"') {
      quoted = !quoted
      continue
    }

    if (char === ',' && !quoted) {
      cells.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  cells.push(current.trim())
  return cells
}

function parseHtml(value: string): RawListing[] {
  const parser = new DOMParser()
  const document = parser.parseFromString(value, 'text/html')
  const jsonListings = parseJsonLd(document)
  const cards = Array.from(
    document.querySelectorAll<HTMLElement>(
      '[data-listing-id], [data-testid*="listing"], [data-testid*="card"], article, .listing, .room-card',
    ),
  )

  const cardListings = cards.map((card) => listingFromElement(card)).filter(hasUsefulListingData)
  return [...jsonListings, ...cardListings]
}

function parseJsonLd(document: Document): RawListing[] {
  const scripts = Array.from(
    document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]'),
  )
  return scripts.flatMap((script) => {
    try {
      const parsed = JSON.parse(script.textContent ?? '') as unknown
      return flattenJsonLd(parsed).map((item) => {
        const record = item as Record<string, unknown>
        const offers = record.offers as Record<string, unknown> | undefined
        const aggregateRating = record.aggregateRating as Record<string, unknown> | undefined
        const address = record.address as Record<string, unknown> | undefined
        const geo = record.geo as Record<string, unknown> | undefined

        return {
          title: stringFrom(record.name),
          location: stringFrom(address?.addressLocality) || stringFrom(address?.addressRegion),
          neighborhood: stringFrom(address?.streetAddress),
          url: stringFrom(record.url),
          priceNightly: numberFor(stringFrom(offers?.price) || stringFrom(record.priceRange)),
          rating: numberFor(stringFrom(aggregateRating?.ratingValue)),
          reviewCount: numberFor(stringFrom(aggregateRating?.reviewCount)),
          latitude: numberFor(stringFrom(geo?.latitude)),
          longitude: numberFor(stringFrom(geo?.longitude)),
          source: 'html',
        }
      })
    } catch {
      return []
    }
  })
}

function flattenJsonLd(value: unknown): unknown[] {
  if (Array.isArray(value)) return value.flatMap(flattenJsonLd)
  if (!value || typeof value !== 'object') return []
  const record = value as Record<string, unknown>
  const graph = record['@graph']
  const self = /lodging|hotel|apartment|accommodation|room/i.test(String(record['@type'] ?? ''))
    ? [record]
    : []
  return graph ? [...self, ...flattenJsonLd(graph)] : self
}

function listingFromElement(element: HTMLElement): RawListing {
  const text = normalizedText(element.textContent ?? '')
  const title =
    textFromSelector(element, 'h1,h2,h3,h4,[data-testid*="title"],[aria-label]') ||
    element.getAttribute('aria-label') ||
    text.split(/[.!?]/, 1)[0]
  const link = element.querySelector<HTMLAnchorElement>('a[href]')
  const amenities = Array.from(element.querySelectorAll('[data-testid*="amenity"], .amenity, li'))
    .map((item) => normalizedText(item.textContent ?? ''))
    .filter((item) => item.length > 2)
    .slice(0, 8)

  return {
    id: element.dataset.listingId,
    title,
    location: textFromSelector(element, '[data-testid*="location"], .location'),
    neighborhood: textFromSelector(element, '[data-testid*="neighborhood"], .neighborhood'),
    url: link?.href,
    priceNightly: priceFromText(text),
    cleaningFee: cleaningFeeFromText(text),
    bedrooms: matchNumber(text, /(\d+(?:\.\d+)?)\s*(?:bedroom|bedrooms|bed\b)/i),
    bathrooms: matchNumber(text, /(\d+(?:\.\d+)?)\s*(?:bath|baths|bathroom|bathrooms)/i),
    guests: matchNumber(text, /(\d+(?:\.\d+)?)\s*(?:guest|guests)/i),
    rating: matchNumber(text, /(\d(?:\.\d+)?)\s*(?:stars?|rating|★)/i),
    reviewCount: matchNumber(text, /(\d+)\s*(?:reviews?|ratings?)/i),
    latitude: numberFor(element.dataset.lat ?? element.dataset.latitude ?? ''),
    longitude: numberFor(element.dataset.lng ?? element.dataset.longitude ?? ''),
    amenities,
    minNights: matchNumber(text, /(\d+)\s*(?:night minimum|min nights|minimum nights)/i),
    occupancyHint: matchNumber(text, /(\d+)%\s*(?:occupied|occupancy)/i) / 100,
    source: 'html',
    rawText: text,
  }
}

function normalizeListing(raw: RawListing, index: number): Listing | null {
  if (!hasUsefulListingData(raw)) return null

  const title = cleanTitle(raw.title || `Imported listing ${index + 1}`)
  const location = cleanText(raw.location) || 'Unknown market'
  const neighborhood = cleanText(raw.neighborhood) || inferNeighborhood(location)
  const priceNightly = positive(raw.priceNightly, 100)
  const listing = {
    id: raw.id || stableId(title, index),
    title,
    location,
    neighborhood,
    url: raw.url,
    priceNightly,
    cleaningFee: positive(raw.cleaningFee, Math.round(priceNightly * 0.22)),
    bedrooms: positive(raw.bedrooms, 1),
    bathrooms: positive(raw.bathrooms, 1),
    guests: positive(raw.guests, Math.max(2, Math.round(positive(raw.bedrooms, 1) * 2))),
    rating: bounded(positive(raw.rating, 4.6), 0, 5),
    reviewCount: positive(raw.reviewCount, 0),
    latitude: validCoordinate(raw.latitude, -90, 90),
    longitude: validCoordinate(raw.longitude, -180, 180),
    amenities: normalizeAmenities(raw.amenities ?? []),
    minNights: positive(raw.minNights, 2),
    occupancyHint: bounded(positive(raw.occupancyHint, 0.7), 0.3, 0.95),
    source: raw.source ?? 'html',
  }

  const parsed = listingSchema.safeParse(listing)
  return parsed.success ? parsed.data : null
}

function hasUsefulListingData(raw: RawListing) {
  return Boolean(raw.title || raw.priceNightly || raw.url || raw.rawText)
}

function stableId(title: string, index: number) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
  return `${slug || 'listing'}-${index + 1}`
}

function textFromSelector(element: HTMLElement, selector: string) {
  const node = element.querySelector<HTMLElement>(selector)
  return normalizedText(node?.textContent ?? node?.getAttribute('aria-label') ?? '')
}

function normalizedText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function cleanText(value: string | undefined) {
  return normalizedText(value ?? '')
}

function cleanTitle(value: string) {
  return titleCase(
    normalizedText(value)
      .replace(/\$\s?\d+.*/, '')
      .replace(/\d+\s*reviews?.*/i, ''),
  )
}

function inferNeighborhood(location: string) {
  return location.split(',')[0]?.trim() || 'Market'
}

function normalizeAmenities(value: string[]) {
  return Array.from(new Set(value.map((item) => item.toLowerCase().trim()).filter(Boolean))).slice(
    0,
    12,
  )
}

function valueFor(record: Record<string, string>, keys: string[]) {
  return keys.map((key) => record[key]).find(Boolean) ?? ''
}

function stringFrom(value: unknown) {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : ''
}

function numberFor(value: string | number | undefined) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (!value) return 0
  const normalized = value.replace(/[^0-9.,-]/g, '').replace(',', '.')
  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function priceFromText(text: string) {
  const match = text.match(moneyPattern)
  return numberFor(match?.[1] ?? match?.[2])
}

function cleaningFeeFromText(text: string) {
  const match = text.match(/(?:cleaning fee|cleaning)\D{0,12}(\d+(?:[,.]\d+)?)/i)
  return numberFor(match?.[1])
}

function matchNumber(text: string, pattern: RegExp) {
  return numberFor(text.match(pattern)?.[1])
}

function positive(value: number | undefined, fallback: number) {
  return value && Number.isFinite(value) && value > 0 ? value : fallback
}

function bounded(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function validCoordinate(value: number | undefined, min: number, max: number) {
  return value && value >= min && value <= max ? value : undefined
}
