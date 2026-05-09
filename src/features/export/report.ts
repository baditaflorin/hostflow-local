import { buildInfo } from '../../lib/build'
import { currency, percent } from '../../lib/format'
import type { CalendarRecommendation } from '../analysis/calendar'
import type { CompetitorInsight } from '../analysis/competitors'
import type { PricingAnalysis } from '../analysis/pricing'
import type { DraftBundle } from '../drafts/drafts'
import type { ImportResult } from '../import/importTypes'
import { listingSchemaVersion, type Listing, type SubjectListing } from '../import/listingSchema'
import type { ActivityEvent } from '../../lib/activity'

export function createMarkdownReport(input: {
  subject: SubjectListing
  listings: Listing[]
  pricing: PricingAnalysis
  calendar: CalendarRecommendation[]
  competitors: CompetitorInsight[]
  drafts: DraftBundle
  importResult?: ImportResult | null
  activity?: ActivityEvent[]
  generatedAt?: string
}) {
  const {
    subject,
    listings,
    pricing,
    calendar,
    competitors,
    drafts,
    importResult,
    activity = [],
  } = input
  const generatedAt = input.generatedAt ?? new Date().toISOString()

  return [
    '# HostFlow Local Report',
    '',
    `Generated: ${generatedAt}`,
    `Schema: ${listingSchemaVersion}`,
    `Import schema: ${importResult?.schemaVersion ?? 'hostflow.import.v2'}`,
    `Version: ${buildInfo.version}`,
    `Commit: ${buildInfo.commit}`,
    `Source fingerprint: ${importResult?.sourceFingerprint ?? 'sample-data'}`,
    `Source shape: ${importResult?.shape ?? 'sample'}`,
    `Import confidence: ${importResult ? percent(importResult.confidence) : 'n/a'}`,
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
    '## Import Intelligence',
    '',
    `- Status: ${importResult?.status ?? 'sample'}`,
    `- Platform: ${importResult?.platform ?? 'unknown'}`,
    `- Source bytes: ${importResult?.sourceBytes ?? 0}`,
    `- Parse time: ${importResult ? `${Math.round(importResult.performanceMs * 100) / 100} ms` : 'n/a'}`,
    '',
    '| Issue | Severity | Why | Next step |',
    '| --- | --- | --- | --- |',
    ...(importResult?.issues.length
      ? importResult.issues.map(
          (issue) => `| ${issue.what} | ${issue.severity} | ${issue.why} | ${issue.nowWhat} |`,
        )
      : ['| None | n/a | No import issues recorded. | Continue. |']),
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
    '',
    '| Listing | Confidence | Currency | Price total | Field notes |',
    '| --- | ---: | --- | ---: | --- |',
    ...listings.map((listing) => {
      const inferred = listing as Listing & {
        confidence?: number
        currency?: string
        priceTotal?: number
        fieldReasons?: Record<string, string>
      }
      const notes = inferred.fieldReasons
        ? Object.entries(inferred.fieldReasons)
            .slice(0, 4)
            .map(([field, reason]) => `${field}: ${reason}`)
            .join('; ')
        : 'sample listing'
      return `| ${listing.title} | ${percent(inferred.confidence ?? 1)} | ${inferred.currency ?? 'n/a'} | ${inferred.priceTotal ? currency(inferred.priceTotal) : 'n/a'} | ${notes} |`
    }),
    '',
    '## Activity',
    '',
    ...activity.slice(0, 8).map((event) => `- ${event.at} ${event.type}: ${event.summary}`),
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
