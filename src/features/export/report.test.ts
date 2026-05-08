import { describe, expect, it } from 'vitest'
import { optimizeCalendar } from '../analysis/calendar'
import { rankCompetitors } from '../analysis/competitors'
import { analyzePricing } from '../analysis/pricing'
import { generateDrafts } from '../drafts/drafts'
import { defaultSubjectListing } from '../import/listingSchema'
import { sampleListings } from '../import/sampleListings'
import { createMarkdownReport } from './report'

describe('createMarkdownReport', () => {
  it('includes version, pricing, and draft sections', () => {
    const pricing = analyzePricing(sampleListings, defaultSubjectListing)
    const calendar = optimizeCalendar(pricing, defaultSubjectListing, 7)
    const competitors = rankCompetitors(
      sampleListings,
      defaultSubjectListing,
      pricing.recommendedTarget,
    )
    const drafts = generateDrafts({
      subject: defaultSubjectListing,
      pricing,
      calendar,
      competitors,
    })

    const report = createMarkdownReport({
      subject: defaultSubjectListing,
      listings: sampleListings,
      pricing,
      calendar,
      competitors,
      drafts,
    })

    expect(report).toContain('# HostFlow Local Report')
    expect(report).toContain('## Pricing')
    expect(report).toContain('## Guest Templates')
  })
})
