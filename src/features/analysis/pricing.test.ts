import { describe, expect, it } from 'vitest'
import { analyzePricing } from './pricing'
import { defaultSubjectListing } from '../import/listingSchema'
import { sampleListings } from '../import/sampleListings'

describe('analyzePricing', () => {
  it('returns a bounded recommendation from comparable listings', () => {
    const analysis = analyzePricing(sampleListings, defaultSubjectListing)

    expect(analysis.sampleSize).toBeGreaterThan(2)
    expect(analysis.recommendedTarget).toBeGreaterThan(80)
    expect(analysis.recommendedLow).toBeLessThan(analysis.recommendedTarget)
    expect(analysis.recommendedHigh).toBeGreaterThan(analysis.recommendedTarget)
    expect(analysis.confidence).toBeGreaterThanOrEqual(0.25)
  })
})
