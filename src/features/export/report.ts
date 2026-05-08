import { buildInfo } from '../../lib/build'
import { currency, percent } from '../../lib/format'
import type { CalendarRecommendation } from '../analysis/calendar'
import type { CompetitorInsight } from '../analysis/competitors'
import type { PricingAnalysis } from '../analysis/pricing'
import type { DraftBundle } from '../drafts/drafts'
import { listingSchemaVersion, type Listing, type SubjectListing } from '../import/listingSchema'

export function createMarkdownReport(input: {
  subject: SubjectListing
  listings: Listing[]
  pricing: PricingAnalysis
  calendar: CalendarRecommendation[]
  competitors: CompetitorInsight[]
  drafts: DraftBundle
}) {
  const { subject, listings, pricing, calendar, competitors, drafts } = input
  const generatedAt = new Date().toISOString()

  return [
    '# HostFlow Local Report',
    '',
    `Generated: ${generatedAt}`,
    `Schema: ${listingSchemaVersion}`,
    `Version: ${buildInfo.version}`,
    `Commit: ${buildInfo.commit}`,
    '',
    '## Subject Listing',
    '',
    `- Name: ${subject.name}`,
    `- Location: ${subject.location}`,
    `- Capacity: ${subject.bedrooms} bedrooms / ${subject.guests} guests`,
    `- Current rate: ${currency(subject.currentRate)}`,
    `- Target occupancy: ${percent(subject.targetOccupancy)}`,
    '',
    '## Pricing',
    '',
    `- Sample size: ${pricing.sampleSize}`,
    `- Median market rate: ${currency(pricing.medianPrice)}`,
    `- Recommended target: ${currency(pricing.recommendedTarget)}`,
    `- Recommended band: ${currency(pricing.recommendedLow)} - ${currency(pricing.recommendedHigh)}`,
    `- Current position: ${pricing.currentPosition}`,
    '',
    '## Calendar',
    '',
    '| Date | Rate | Min nights | Action |',
    '| --- | ---: | ---: | --- |',
    ...calendar
      .slice(0, 14)
      .map((day) => `| ${day.date} | ${currency(day.rate)} | ${day.minNights} | ${day.action} |`),
    '',
    '## Competitors',
    '',
    '| Listing | Rate | Score | Gap |',
    '| --- | ---: | ---: | ---: |',
    ...competitors
      .slice(0, 8)
      .map(
        (competitor) =>
          `| ${competitor.listing.title} | ${currency(competitor.listing.priceNightly)} | ${competitor.score} | ${currency(competitor.priceDelta)} |`,
      ),
    '',
    '## Listing Copy',
    '',
    ...drafts.listingTitleOptions.map((title) => `- ${title}`),
    '',
    drafts.listingSummary,
    '',
    '## Guest Templates',
    '',
    ...drafts.guestTemplates.flatMap((template) => [
      `### ${template.title}`,
      '',
      template.body,
      '',
    ]),
    '## Imported Listings',
    '',
    `Imported comparable count: ${listings.length}`,
  ].join('\n')
}

export function downloadMarkdown(filename: string, markdown: string) {
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
