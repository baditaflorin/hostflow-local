import { describe, expect, it } from 'vitest'
import { defaultSubjectListing } from '../import/listingSchema'
import { isOrphanGap, optimizeCalendar } from './calendar'
import type { PricingAnalysis } from './pricing'

const baseAnalysis: PricingAnalysis = {
  sampleSize: 8,
  averagePrice: 150,
  medianPrice: 145,
  p25: 130,
  p75: 170,
  recommendedLow: 120,
  recommendedTarget: 150,
  recommendedHigh: 180,
  currentPosition: 'market aligned',
  occupancySignal: 'balanced demand',
  confidence: 0.7,
  explanation: [],
}

describe('orphan gap detection', () => {
  it('flags a 1-night gap between two bookings', () => {
    const booked = new Set(['2026-06-10', '2026-06-12'])
    expect(isOrphanGap('2026-06-11', booked)).toBe(true)
  })

  it('flags a 2-night gap between two bookings', () => {
    const booked = new Set(['2026-06-08', '2026-06-11'])
    expect(isOrphanGap('2026-06-09', booked)).toBe(true)
    expect(isOrphanGap('2026-06-10', booked)).toBe(true)
  })

  it('does not flag an open week with no bookings on one side', () => {
    const booked = new Set(['2026-06-10'])
    expect(isOrphanGap('2026-06-11', booked)).toBe(false)
    expect(isOrphanGap('2026-06-15', booked)).toBe(false)
  })

  it('does not flag a booked day as an orphan', () => {
    const booked = new Set(['2026-06-10', '2026-06-11', '2026-06-12'])
    expect(isOrphanGap('2026-06-11', booked)).toBe(false)
  })

  it('does not flag a wide gap where each side is too distant', () => {
    const booked = new Set(['2026-06-05', '2026-06-15'])
    // Middle of a 9-night gap: neither side is within 2 days of 2026-06-10.
    expect(isOrphanGap('2026-06-10', booked)).toBe(false)
  })
})

describe('optimizeCalendar with booked dates', () => {
  it('marks booked dates and discounts true orphan gaps', () => {
    const subject = {
      ...defaultSubjectListing,
      bookedDates: ['2026-06-10', '2026-06-12'],
    }
    const calendar = optimizeCalendar(baseAnalysis, subject, 30, new Date('2026-06-09T12:00:00'))
    const byDate = new Map(calendar.map((entry) => [entry.date, entry]))
    expect(byDate.get('2026-06-10')?.booked).toBe(true)
    expect(byDate.get('2026-06-12')?.booked).toBe(true)
    expect(byDate.get('2026-06-11')?.orphanGap).toBe(true)
    // Orphan night should price lower than a non-orphan weekday on the
    // same calendar.
    const orphan = byDate.get('2026-06-11')!
    const nonOrphan = byDate.get('2026-06-25')!
    expect(orphan.rate).toBeLessThan(nonOrphan.rate)
  })

  it('produces no orphan flags when bookedDates is empty', () => {
    const calendar = optimizeCalendar(baseAnalysis, defaultSubjectListing, 30)
    expect(calendar.every((entry) => !entry.orphanGap)).toBe(true)
    expect(calendar.every((entry) => !entry.booked)).toBe(true)
  })
})
