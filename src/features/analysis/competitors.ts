import type { Listing, SubjectListing } from '../import/listingSchema'

export type CompetitorInsight = {
  listing: Listing
  score: number
  priceDelta: number
  strengths: string[]
  opportunities: string[]
  distanceKm?: number
}

export function rankCompetitors(
  listings: Listing[],
  subject: SubjectListing,
  targetRate: number,
): CompetitorInsight[] {
  return listings
    .map((listing) => {
      const fitScore =
        100 -
        Math.abs(listing.bedrooms - subject.bedrooms) * 12 -
        Math.abs(listing.guests - subject.guests) * 4 +
        listing.rating * 5 +
        Math.min(listing.reviewCount / 8, 18) +
        listing.occupancyHint * 18
      return {
        listing,
        score: Math.round(fitScore),
        priceDelta: Math.round(listing.priceNightly - targetRate),
        strengths: strengthsFor(listing),
        opportunities: opportunitiesFor(listing, subject),
        distanceKm: distanceFromSubject(listing),
      }
    })
    .toSorted((a, b) => b.score - a.score)
}

function strengthsFor(listing: Listing) {
  const strengths = []
  if (listing.rating >= 4.85) strengths.push('excellent rating')
  if (listing.reviewCount >= 100) strengths.push('deep review history')
  if (listing.occupancyHint >= 0.78) strengths.push('strong demand signal')
  if (listing.amenities.length >= 5) strengths.push('amenity-rich positioning')
  return strengths.length ? strengths : ['clear benchmark competitor']
}

function opportunitiesFor(listing: Listing, subject: SubjectListing) {
  const subjectAmenities = subject.standoutAmenities.map((amenity) => amenity.toLowerCase())
  const missing = subjectAmenities.filter(
    (amenity) => !listing.amenities.some((candidate) => candidate.includes(amenity)),
  )
  const opportunities = missing.slice(0, 3).map((amenity) => `out-message ${amenity}`)
  if (listing.cleaningFee > subject.cleaningFee + 15) opportunities.push('simpler fee story')
  if (listing.minNights > 2) opportunities.push('more flexible stays')
  return opportunities.length ? opportunities : ['match quality, compete on clarity']
}

function distanceFromSubject(listing: Listing) {
  if (listing.latitude === undefined || listing.longitude === undefined) return undefined
  const center = { latitude: 44.436, longitude: 26.102 }
  const earthKm = 6371
  const dLat = toRad(listing.latitude - center.latitude)
  const dLon = toRad(listing.longitude - center.longitude)
  const lat1 = toRad(center.latitude)
  const lat2 = toRad(listing.latitude)
  const a = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return Math.round(earthKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10
}

function toRad(value: number) {
  return (value * Math.PI) / 180
}
