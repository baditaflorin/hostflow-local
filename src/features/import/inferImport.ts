import { titleCase } from '../../lib/format'
import type {
  ImportIssue,
  ImportResult,
  InferredListing,
  InputShape,
  MarketCalendarRow,
} from './importTypes'
import { inferredListingSchema } from './importTypes'
import { cell, mapHeaders } from './fieldMap'
import { normalizeInput, stableHash } from './normalizeInput'
import { classifyInput, detectPlatform } from './shapeClassifier'
import { inferPrice, inferRating, issue, parseNumber, parsePercent } from './valueParsers'

type PartialListing = Partial<InferredListing> & {
  fieldConfidence: Record<string, number>
  fieldReasons: Record<string, string>
  issues: ImportIssue[]
}

export function inferImport(raw: string): ImportResult {
  const started = performance.now()
  const normalized = normalizeInput(raw)
  const classification = classifyInput(normalized.text)
  const listings: InferredListing[] = []
  const marketRows: MarketCalendarRow[] = []
  const issues = [...classification.issues]
  const anomalies: ImportIssue[] = []

  if (classification.table) {
    const parsed = parseTable(classification)
    listings.push(...parsed.listings)
    marketRows.push(...parsed.marketRows)
    issues.push(...parsed.issues)
    anomalies.push(...parsed.anomalies)
  } else if (classification.shape === 'ota_cards' || classification.shape === 'json_ld') {
    const parsed = parseHtmlCards(normalized.text, classification.shape)
    listings.push(...parsed.listings)
    issues.push(...parsed.issues)
    anomalies.push(...parsed.anomalies)
  }

  const status = statusFor(classification.shape, listings.length, marketRows.length, issues)
  const confidence = overallConfidence(classification.confidence, listings, marketRows, issues)

  return {
    schemaVersion: 'hostflow.import.v2',
    sourceFingerprint: normalized.fingerprint,
    sourceBytes: normalized.bytes,
    shape: classification.shape,
    platform: classification.platform,
    confidence,
    status,
    listings,
    marketRows,
    issues,
    anomalies,
    summary: summaryFor(classification.shape, listings.length, marketRows.length, issues),
    performanceMs: performance.now() - started,
  }
}

function parseTable(classification: ReturnType<typeof classifyInput>) {
  const table = classification.table
  if (!table) return { listings: [], marketRows: [], issues: [], anomalies: [] }

  const { fields, reasons } = mapHeaders(table.headers)
  const issues: ImportIssue[] = []
  const anomalies: ImportIssue[] = []

  if (
    fields.has('email') ||
    fields.has('phone') ||
    fields.has('firstName') ||
    fields.has('lastName')
  ) {
    issues.push(
      issue(
        'pii_columns_detected',
        'warning',
        'Guest contact columns were detected.',
        'Reservation exports often contain PII that should not appear in recommendations.',
        'HostFlow ignores guest names, emails, and phones in analysis and export summaries.',
      ),
    )
  }

  if (classification.shape === 'market_calendar') {
    issues.push(
      issue(
        'market_calendar_not_comp_set',
        'info',
        'Market calendar rows were detected.',
        'These rows describe demand by date, not individual competitor listings.',
        'Use them as calendar context, not as a competitor set.',
      ),
    )
    return {
      listings: [],
      marketRows: table.rows.map((row) => marketRowFromCsv(row, fields)),
      issues,
      anomalies,
    }
  }

  const listings = table.rows
    .map((row, index) =>
      listingFromCsv(row, index, classification.shape, fields, reasons, classification.platform),
    )
    .filter((listing): listing is InferredListing => listing !== null)

  if (classification.shape === 'reservation_history') {
    issues.push(
      issue(
        'reservation_history_not_comp_set',
        'info',
        'Reservation history was detected.',
        'Reservations describe your past bookings, not market competitors.',
        'Use the derived ADR as a pricing clue and verify against competitor cards.',
      ),
    )
  }

  if (classification.shape === 'market_benchmark') {
    issues.push(
      issue(
        'benchmark_summary_not_individual_listing',
        'info',
        'Market benchmark summary was detected.',
        'This is an aggregate estimate, not an individual listing.',
        'Use it as a cautious baseline and verify with competitor cards.',
      ),
    )
  }

  return { listings, marketRows: [], issues, anomalies }
}

function listingFromCsv(
  row: string[],
  index: number,
  shape: InputShape,
  fields: Map<string, number>,
  reasons: Map<string, string>,
  platform?: string,
) {
  const fieldConfidence: Record<string, number> = {}
  const fieldReasons: Record<string, string> = {}
  const issues: ImportIssue[] = []
  const set = (field: string, confidence: number, reason: string) => {
    fieldConfidence[field] = confidence
    fieldReasons[field] = reason
  }

  const rawTitle =
    cell(row, fields, 'title') ||
    cell(row, fields, 'id') ||
    `${titleCase(shape.replace(/_/g, ' '))} ${index + 1}`
  const title = preserveHostAcronyms(titleCase(rawTitle))
  set(
    'title',
    fields.has('title') ? 0.88 : 0.48,
    reasons.get('title') ?? 'Used source identifier as title.',
  )

  const rawNightly = cell(row, fields, 'priceNightly')
  const rawTotal = cell(row, fields, 'priceTotal')
  const dateNights = nightsFromDates(cell(row, fields, 'checkin'), cell(row, fields, 'checkout'))
  const rawNights = cell(row, fields, 'nights')
  const nights = parseNumber(rawNights) || dateNights
  const priceTotal = parseNumber(rawTotal)
  const priceNightly = rawNightly
    ? parseNumber(rawNightly)
    : priceTotal && nights
      ? Math.round(priceTotal / nights)
      : 100

  if (rawTotal && nights && !rawNightly) {
    issues.push(
      issue(
        rawNights ? 'adr_derived_from_total_and_nights' : 'adr_derived_from_total_and_dates',
        'info',
        'Nightly rate was derived from reservation total.',
        'The export had total revenue and stay length instead of nightly ADR.',
        'Verify taxes and platform fees if you need pure nightly rate.',
      ),
    )
    set('priceNightly', 0.72, 'Derived nightly rate from total price and nights.')
  } else {
    set(
      'priceNightly',
      rawNightly ? 0.86 : 0.42,
      reasons.get('priceNightly') ?? 'No price header found; defaulted cautiously.',
    )
  }

  const currency = cell(row, fields, 'currency') || currencyFromText(rawNightly || rawTotal)
  if (!currency) {
    issues.push(
      issue(
        'currency_assumed',
        'info',
        'Currency was not explicit.',
        'The row had a price but no currency column or symbol.',
        'Verify currency before relying on recommendations.',
      ),
    )
  }

  const rawOccupancy = cell(row, fields, 'occupancyHint')
  if (rawNightly.includes(',') || rawOccupancy.includes(',')) {
    issues.push(
      issue(
        'decimal_comma_normalized',
        'info',
        'Decimal comma was normalized.',
        'The row used comma decimal notation.',
        'No action needed unless the value looks shifted.',
      ),
    )
  }

  return completeListing({
    id: cell(row, fields, 'id') || stableHash(`${shape}:${title}:${index}`).slice(0, 12),
    title,
    location: cell(row, fields, 'location') || 'Imported market',
    neighborhood:
      cell(row, fields, 'neighborhood') || cell(row, fields, 'location') || 'Imported market',
    priceNightly,
    priceTotal: priceTotal || undefined,
    cleaningFee: parseNumber(cell(row, fields, 'cleaningFee')) || Math.round(priceNightly * 0.2),
    bedrooms: parseNumber(cell(row, fields, 'bedrooms')) || bedroomFromTitle(title),
    bathrooms: parseNumber(cell(row, fields, 'bathrooms')) || 1,
    guests: parseNumber(cell(row, fields, 'guests')) || 2,
    rating: normalizeRating(parseNumber(cell(row, fields, 'rating')) || 4.6),
    reviewCount: parseNumber(cell(row, fields, 'reviewCount')),
    amenities: cell(row, fields, 'amenities')
      .split(/[;|]/)
      .map((item) => item.trim())
      .filter(Boolean),
    minNights: nights || 2,
    occupancyHint: rawOccupancy ? parsePercent(rawOccupancy) : 0.7,
    source: 'csv',
    sourceShape: shape,
    platform: platform || cell(row, fields, 'platform').toLowerCase() || undefined,
    currency: currency || 'USD',
    fieldConfidence,
    fieldReasons,
    issues,
  })
}

function parseHtmlCards(text: string, shape: InputShape) {
  const document = new DOMParser().parseFromString(text, 'text/html')
  const cards = Array.from(
    document.querySelectorAll<HTMLElement>(
      '[data-listing-id], [data-testid*="property-card"], [data-testid*="listing"], [data-testid*="card"], article, .listing, .room-card',
    ),
  )
  const elements = cards.length ? cards : [document.body].filter(Boolean)
  const listings = elements
    .map((element, index) => listingFromHtml(element, index, shape))
    .filter((listing): listing is InferredListing => listing !== null)
  return { listings, issues: [], anomalies: [] }
}

function listingFromHtml(element: HTMLElement, index: number, shape: InputShape) {
  const text = collapseText(element.textContent ?? '')
  if (!text) return null

  const title = titleCase(
    collapseText(
      element.querySelector('h1,h2,h3,h4,a,[aria-label]')?.textContent ??
        element.getAttribute('aria-label') ??
        text.split(/[.!?·]/, 1)[0] ??
        `Listing ${index + 1}`,
    ),
  )
  const link = element.querySelector<HTMLAnchorElement>('a[href]')
  const price = inferPrice(text)
  const rating = inferRating(text)
  const issues = [...price.issues, ...(rating?.issue ? [rating.issue] : [])]
  const fieldConfidence: Record<string, number> = {}
  const fieldReasons: Record<string, string> = {}
  const set = (field: string, confidence: number, reason: string) => {
    fieldConfidence[field] = confidence
    fieldReasons[field] = reason
  }

  set('title', title ? 0.76 : 0.35, 'Detected title from heading, link, or card text.')
  set(
    'priceNightly',
    price.nightly?.confidence ?? 0.25,
    price.nightly?.reason ?? 'No price found; defaulted cautiously.',
  )
  if (price.currency) set('currency', price.currency.confidence, price.currency.reason)
  if (rating) set('rating', rating.confidence, rating.reason)

  return completeListing({
    id: element.dataset.listingId || stableHash(`${title}:${text}:${index}`).slice(0, 12),
    title,
    location: 'Imported market',
    neighborhood: 'Imported market',
    url: link
      ? new URL(link.getAttribute('href') ?? '', window.location.href).toString()
      : undefined,
    priceNightly: price.nightly?.value ?? 100,
    priceTotal: price.total?.value,
    cleaningFee: Math.round((price.nightly?.value ?? 100) * 0.2),
    bedrooms: bedroomFromText(text),
    bathrooms: numberPattern(text, /(\d+(?:[.,]\d+)?)\s*(?:bath|baths|bathroom|bathrooms)/i) || 1,
    guests:
      numberPattern(text, /(?:sleeps|voyageurs?|guests?)\s*(\d+)/i) ||
      numberPattern(text, /(\d+)\s*(?:guest|guests)/i) ||
      2,
    rating: rating?.value ?? 4.6,
    reviewCount: numberPattern(text, /(\d+)\s*(?:reviews?|ratings?)/i),
    amenities: Array.from(element.querySelectorAll('li,[data-testid*="amenity"],.amenity'))
      .map((item) => collapseText(item.textContent ?? '').toLowerCase())
      .filter(Boolean)
      .slice(0, 12),
    minNights: price.nights?.value ?? 2,
    occupancyHint: 0.7,
    source: 'html',
    sourceShape: shape,
    platform: detectPlatform(element.outerHTML || text),
    currency: price.currency?.value ?? 'USD',
    fieldConfidence,
    fieldReasons,
    issues,
  })
}

function completeListing(input: PartialListing): InferredListing | null {
  const confidenceValues = Object.values(input.fieldConfidence)
  const confidence = confidenceValues.length
    ? confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length
    : 0.45
  const candidate = {
    ...input,
    stableId: input.id ?? stableHash(`${input.title}:${input.priceNightly}`).slice(0, 12),
    priceNightly: Math.max(1, Number(input.priceNightly ?? 100)),
    cleaningFee: Math.max(0, Number(input.cleaningFee ?? 0)),
    bedrooms: Math.max(1, Number(input.bedrooms ?? 1)),
    bathrooms: Math.max(1, Number(input.bathrooms ?? 1)),
    guests: Math.max(1, Number(input.guests ?? 2)),
    rating: Math.min(5, Math.max(0, Number(input.rating ?? 4.6))),
    reviewCount: Math.max(0, Number(input.reviewCount ?? 0)),
    minNights: Math.max(1, Number(input.minNights ?? 2)),
    occupancyHint: Math.min(0.95, Math.max(0.3, Number(input.occupancyHint ?? 0.7))),
    amenities: input.amenities ?? [],
    confidence: Math.round(confidence * 100) / 100,
  }

  const parsed = inferredListingSchema.safeParse(candidate)
  return parsed.success ? parsed.data : null
}

function marketRowFromCsv(row: string[], fields: Map<string, number>): MarketCalendarRow {
  return {
    date: cell(row, fields, 'date'),
    marketAdr: parseNumber(cell(row, fields, 'marketAdr') || cell(row, fields, 'priceNightly')),
    occupancyHint: parsePercent(cell(row, fields, 'occupancyHint')),
    bookingWindow: parseNumber(cell(row, fields, 'bookingWindow')) || undefined,
    lengthOfStay: parseNumber(cell(row, fields, 'nights')) || undefined,
    confidence: 0.78,
  }
}

function statusFor(
  shape: InputShape,
  listingCount: number,
  marketRows: number,
  issues: ImportIssue[],
) {
  if (issues.some((item) => item.severity === 'fatal-error')) return 'fatal-error'
  if (
    issues.some((item) => item.severity === 'recoverable-error') &&
    listingCount === 0 &&
    marketRows === 0
  ) {
    return 'recoverable-error'
  }
  if (listingCount + marketRows === 0)
    return shape === 'empty' ? 'loaded-empty' : 'recoverable-error'
  if (issues.some((item) => item.severity === 'warning')) return 'loaded-partial'
  return listingCount + marketRows >= 10 ? 'loaded-many' : 'loaded-some'
}

function overallConfidence(
  shapeConfidence: number,
  listings: InferredListing[],
  marketRows: MarketCalendarRow[],
  issues: ImportIssue[],
) {
  const rowValues = [
    ...listings.map((listing) => listing.confidence),
    ...marketRows.map((row) => row.confidence),
  ]
  const rowConfidence = rowValues.length
    ? rowValues.reduce((sum, value) => sum + value, 0) / rowValues.length
    : shapeConfidence
  const penalty = issues.reduce((sum, item) => {
    if (item.severity === 'warning') return sum + 0.06
    if (item.severity === 'fatal-error') return sum + 0.18
    if (item.severity === 'recoverable-error') return sum + 0.03
    return sum
  }, 0)
  return Math.max(
    0,
    Math.min(1, Math.round((shapeConfidence * 0.35 + rowConfidence * 0.65 - penalty) * 100) / 100),
  )
}

function summaryFor(
  shape: InputShape,
  listingCount: number,
  marketRows: number,
  issues: ImportIssue[],
) {
  const problem = issues.find((item) => item.severity.includes('error'))
  if (problem) return `${problem.what} ${problem.nowWhat}`
  if (shape === 'market_calendar')
    return `Detected ${marketRows} market calendar row${marketRows === 1 ? '' : 's'}.`
  return `Detected ${listingCount} usable listing${listingCount === 1 ? '' : 's'} from ${shape.replace(/_/g, ' ')}.`
}

function bedroomFromText(text: string) {
  if (/\bstudio\b/i.test(text)) return 1
  return numberPattern(text, /(\d+(?:[.,]\d+)?)\s*(?:bedroom|bedrooms|bed\b)/i) || 1
}

function bedroomFromTitle(title: string) {
  const match = title.match(/(\d+)\s*br\b/i)
  return match ? parseNumber(match[1]) : 1
}

function numberPattern(text: string, pattern: RegExp) {
  return parseNumber(text.match(pattern)?.[1])
}

function currencyFromText(text: string) {
  if (/\bEUR\b|€/i.test(text)) return 'EUR'
  if (/\bGBP\b|£/i.test(text)) return 'GBP'
  if (/\bRON\b/i.test(text)) return 'RON'
  if (/\bUSD\b|\$/i.test(text)) return 'USD'
  return ''
}

function normalizeRating(rating: number) {
  return rating > 5 ? Math.round((rating / 2) * 100) / 100 : rating
}

function nightsFromDates(checkin: string, checkout: string) {
  const start = parseHostDate(checkin)
  const end = parseHostDate(checkout)
  if (!start || !end) return 0
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000))
}

function parseHostDate(value: string) {
  if (!value) return null
  if (/^\d{5}$/.test(value)) return new Date((parseNumber(value) - 25569) * 86_400_000)
  const us = value.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/)
  if (us) return new Date(Number(us[3]), Number(us[1]) - 1, Number(us[2]))
  const iso = Date.parse(value)
  return Number.isFinite(iso) ? new Date(iso) : null
}

function collapseText(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

function preserveHostAcronyms(title: string) {
  return title.replace(/\b(\d+)\s*br\b/gi, '$1BR')
}
