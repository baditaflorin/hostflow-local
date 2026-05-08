import { clamp, isoDate } from '../../lib/format'
import type { SubjectListing } from '../import/listingSchema'
import type { PricingAnalysis } from './pricing'

export type CalendarRecommendation = {
  date: string
  dayName: string
  rate: number
  minNights: number
  action: string
  demand: 'low' | 'normal' | 'high'
}

export function optimizeCalendar(
  analysis: PricingAnalysis,
  subject: SubjectListing,
  days = 30,
): CalendarRecommendation[] {
  const start = new Date()
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    const day = date.getDay()
    const weekend = day === 5 || day === 6
    const orphanGap = index % 11 === 3 || index % 17 === 7
    const leadTime = index < 5 ? -0.08 : index > 21 ? 0.04 : 0
    const weekendPremium = weekend ? 0.16 : 0
    const demandPremium =
      analysis.occupancySignal === 'hot demand'
        ? 0.08
        : analysis.occupancySignal === 'soft demand'
          ? -0.06
          : 0
    const gapDiscount = orphanGap ? -0.11 : 0
    const rate = Math.round(
      analysis.recommendedTarget * (1 + weekendPremium + demandPremium + gapDiscount + leadTime),
    )
    const minNights =
      weekend && !orphanGap ? Math.max(2, Math.round(subject.bedrooms)) : orphanGap ? 1 : 2

    return {
      date: isoDate(date),
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      rate: clamp(rate, analysis.recommendedLow, analysis.recommendedHigh + 40),
      minNights,
      action: actionFor({ weekend, orphanGap, index, occupancySignal: analysis.occupancySignal }),
      demand:
        weekend || analysis.occupancySignal === 'hot demand'
          ? 'high'
          : orphanGap
            ? 'low'
            : 'normal',
    }
  })
}

function actionFor(input: {
  weekend: boolean
  orphanGap: boolean
  index: number
  occupancySignal: PricingAnalysis['occupancySignal']
}) {
  if (input.orphanGap) return 'Fill gap with one-night opener'
  if (input.index < 5) return 'Last-minute visibility push'
  if (input.weekend && input.occupancySignal !== 'soft demand') return 'Hold premium weekend rate'
  if (input.occupancySignal === 'soft demand') return 'Keep flexible cancellation'
  return 'Maintain benchmark rate'
}
