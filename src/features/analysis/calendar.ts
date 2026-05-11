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
  booked: boolean
  orphanGap: boolean
}

export function optimizeCalendar(
  analysis: PricingAnalysis,
  subject: SubjectListing,
  days = 30,
  startDate: Date = new Date(),
): CalendarRecommendation[] {
  const bookedSet = new Set(subject.bookedDates ?? [])
  const start = startDate
  // Build the date sequence first so the orphan-gap detector can look at
  // booked status on both sides of each cell.
  const dates: string[] = Array.from({ length: days }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return isoDate(date)
  })

  return dates.map((iso, index) => {
    const date = new Date(`${iso}T12:00:00`)
    const day = date.getDay()
    const weekend = day === 5 || day === 6
    const booked = bookedSet.has(iso)
    const orphanGap = !booked && isOrphanGap(iso, bookedSet)
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
    const minNights = booked
      ? 1
      : orphanGap
        ? 1
        : weekend
          ? Math.max(2, Math.round(subject.bedrooms))
          : 2

    return {
      date: iso,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      rate: clamp(rate, analysis.recommendedLow, analysis.recommendedHigh + 40),
      minNights,
      action: actionFor({
        weekend,
        orphanGap,
        booked,
        index,
        occupancySignal: analysis.occupancySignal,
      }),
      demand: booked
        ? 'high'
        : weekend || analysis.occupancySignal === 'hot demand'
          ? 'high'
          : orphanGap
            ? 'low'
            : 'normal',
      booked,
      orphanGap,
    }
  })
}

/**
 * A date is an orphan gap if it's an unbooked window of 1 or 2 nights with
 * a booked night within 2 days on the previous side AND a booked night
 * within 2 days on the next side. That captures the classic small-gap
 * problem hosts face: a single night between two reservations that almost
 * never fills at the regular minimum-night rule.
 */
export function isOrphanGap(iso: string, bookedSet: ReadonlySet<string>): boolean {
  if (bookedSet.has(iso)) return false
  const previous = nearestBookedOnSide(iso, bookedSet, -1, 2)
  const next = nearestBookedOnSide(iso, bookedSet, 1, 2)
  return previous !== null && next !== null
}

function nearestBookedOnSide(
  iso: string,
  bookedSet: ReadonlySet<string>,
  direction: -1 | 1,
  maxDistance: number,
): string | null {
  const start = new Date(`${iso}T12:00:00`)
  for (let step = 1; step <= maxDistance; step += 1) {
    const probe = new Date(start)
    probe.setDate(start.getDate() + direction * step)
    const probeIso = isoDate(probe)
    if (bookedSet.has(probeIso)) return probeIso
  }
  return null
}

function actionFor(input: {
  weekend: boolean
  orphanGap: boolean
  booked: boolean
  index: number
  occupancySignal: PricingAnalysis['occupancySignal']
}) {
  if (input.booked) return 'Booked — confirm guest details'
  if (input.orphanGap) return 'Fill gap with one-night opener'
  if (input.index < 5) return 'Last-minute visibility push'
  if (input.weekend && input.occupancySignal !== 'soft demand') return 'Hold premium weekend rate'
  if (input.occupancySignal === 'soft demand') return 'Keep flexible cancellation'
  return 'Maintain benchmark rate'
}
