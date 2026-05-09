import { normalizeKey } from './normalizeInput'

const synonyms: Record<string, string[]> = {
  id: ['id', 'uuid', 'listing_id', 'confirmation_code'],
  title: ['title', 'name', 'listing', 'listing_name', 'estimate_name', 'titre'],
  location: ['location', 'city', 'market', 'address'],
  neighborhood: ['neighborhood', 'district', 'area', 'quartier'],
  priceNightly: ['price', 'nightly_price', 'rate', 'prix_nuit', 'average_daily_rate', 'market_adr'],
  priceTotal: ['total_price', 'total', 'total_stay_price'],
  cleaningFee: ['cleaning_fee', 'cleaning'],
  bedrooms: ['bedrooms', 'bedroom', 'chambres'],
  bathrooms: ['bathrooms', 'baths', 'bath'],
  guests: ['guests', 'guest_count', 'number_of_guests', 'capacity', 'voyageurs'],
  rating: ['rating', 'stars', 'note', 'review_rating'],
  reviewCount: ['reviews', 'review_count', 'avis'],
  amenities: ['amenities'],
  occupancyHint: ['occupancy', 'occupancy_hint', 'adjusted_occupancy'],
  nights: ['nights', 'length_of_stay'],
  checkin: ['checkin_date', 'check_in_date', 'arrival_date'],
  checkout: ['checkout_date', 'check_out_date', 'departure_date'],
  date: ['date', 'stay_date'],
  bookingWindow: ['booking_window'],
  currency: ['currency'],
  platform: ['platform', 'source'],
  annualRevenue: ['annual_revenue'],
  marketAdr: ['market_adr', 'average_daily_rate'],
  email: ['email', 'guest_email'],
  phone: ['phone', 'guest_phone'],
  firstName: ['first_name'],
  lastName: ['last_name'],
}

const normalizedSynonyms = Object.fromEntries(
  Object.entries(synonyms).map(([field, values]) => [field, values.map(normalizeKey)]),
)

export function mapHeaders(headers: string[]) {
  const normalized = headers.map(normalizeKey)
  const result = new Map<string, number>()
  const reasons = new Map<string, string>()

  Object.entries(normalizedSynonyms).forEach(([field, keys]) => {
    const index = normalized.findIndex((header) => keys.includes(header))
    if (index >= 0) {
      result.set(field, index)
      reasons.set(field, `Mapped "${headers[index]}" to ${field}.`)
      return
    }

    const fuzzyIndex = normalized.findIndex((header) =>
      keys.some((key) => header.includes(key) || key.includes(header)),
    )
    if (fuzzyIndex >= 0) {
      result.set(field, fuzzyIndex)
      reasons.set(field, `Fuzzy-mapped "${headers[fuzzyIndex]}" to ${field}.`)
    }
  })

  return { fields: result, reasons, normalizedHeaders: normalized }
}

export function cell(row: string[], fields: Map<string, number>, name: string) {
  const index = fields.get(name)
  return index === undefined ? '' : (row[index] ?? '')
}
