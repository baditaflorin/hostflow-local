import type { Listing } from '../import/listingSchema'

const comparableHeaders = [
  'id',
  'title',
  'location',
  'neighborhood',
  'priceNightly',
  'cleaningFee',
  'bedrooms',
  'bathrooms',
  'guests',
  'rating',
  'reviewCount',
  'minNights',
  'occupancyHint',
  'source',
] as const

export function exportComparablesCsv(listings: Listing[]) {
  const rows = listings.map((listing) =>
    comparableHeaders.map((header) => csvCell(String(listing[header] ?? ''))).join(','),
  )
  return [comparableHeaders.join(','), ...rows].join('\n')
}

export function exportComparablesJson(listings: Listing[]) {
  return JSON.stringify(
    listings.map((listing) =>
      comparableHeaders.reduce<Record<string, string | number>>((record, header) => {
        record[header] = listing[header]
        return record
      }, {}),
    ),
    null,
    2,
  )
}

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`
}
