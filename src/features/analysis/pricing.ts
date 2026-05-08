import { clamp } from '../../lib/format'
import type { Listing, SubjectListing } from '../import/listingSchema'
import { mean, median, percentile, standardDeviation } from './statistics'

export type PricingAnalysis = {
  sampleSize: number
  averagePrice: number
  medianPrice: number
  p25: number
  p75: number
  recommendedLow: number
  recommendedTarget: number
  recommendedHigh: number
  currentPosition: 'below market' | 'market aligned' | 'above market'
  occupancySignal: 'soft demand' | 'balanced demand' | 'hot demand'
  confidence: number
  explanation: string[]
}

export function analyzePricing(listings: Listing[], subject: SubjectListing): PricingAnalysis {
  const comparables = comparableListings(listings, subject)
  const prices = comparables.map((listing) => listing.priceNightly)
  const medianPrice = median(prices)
  const p25 = percentile(prices, 0.25)
  const p75 = percentile(prices, 0.75)
  const occupancy = mean(comparables.map((listing) => listing.occupancyHint))
  const qualityPremium = qualityPremiumFor(subject)
  const demandPremium = clamp((occupancy - subject.targetOccupancy) * 0.35, -0.12, 0.12)
  const bedroomDelta = clamp(
    (subject.bedrooms - mean(comparables.map((listing) => listing.bedrooms))) * 0.08,
    -0.12,
    0.18,
  )
  const target = Math.round(
    (medianPrice || subject.currentRate) * (1 + qualityPremium + demandPremium + bedroomDelta),
  )
  const spread = Math.max(12, standardDeviation(prices) * 0.28)
  const currentRatio = subject.currentRate / Math.max(target, 1)

  return {
    sampleSize: comparables.length,
    averagePrice: Math.round(mean(prices)),
    medianPrice: Math.round(medianPrice),
    p25: Math.round(p25),
    p75: Math.round(p75),
    recommendedLow: Math.max(35, Math.round(target - spread)),
    recommendedTarget: Math.max(40, target),
    recommendedHigh: Math.round(target + spread),
    currentPosition:
      currentRatio < 0.92
        ? 'below market'
        : currentRatio > 1.08
          ? 'above market'
          : 'market aligned',
    occupancySignal:
      occupancy < 0.62 ? 'soft demand' : occupancy > 0.78 ? 'hot demand' : 'balanced demand',
    confidence: clamp(comparables.length / 12, 0.25, 0.92),
    explanation: [
      `${comparables.length} comparable listings matched ${subject.bedrooms} bedroom / ${subject.guests} guest demand.`,
      `Median nightly rate is ${Math.round(medianPrice)}, with the middle band from ${Math.round(p25)} to ${Math.round(p75)}.`,
      `Demand signal is ${Math.round(occupancy * 100)}% based on imported occupancy hints.`,
    ],
  }
}

function comparableListings(listings: Listing[], subject: SubjectListing) {
  const closeMatches = listings.filter(
    (listing) =>
      Math.abs(listing.bedrooms - subject.bedrooms) <= 1 &&
      Math.abs(listing.guests - subject.guests) <= 2,
  )
  return closeMatches.length >= 3 ? closeMatches : listings
}

function qualityPremiumFor(subject: SubjectListing) {
  const premiumAmenities = [
    'view',
    'parking',
    'workspace',
    'fast wi-fi',
    'self check-in',
    'balcony',
    'sauna',
  ]
  const normalized = subject.standoutAmenities.map((amenity) => amenity.toLowerCase())
  const matches = premiumAmenities.filter((amenity) =>
    normalized.some((candidate) => candidate.includes(amenity)),
  )
  return clamp(matches.length * 0.025, 0, 0.1)
}
