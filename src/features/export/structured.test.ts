import { describe, expect, it } from 'vitest'
import { sampleListings } from '../import/sampleListings'
import { exportComparablesCsv, exportComparablesJson } from './structured'

describe('structured exports', () => {
  it('serializes comparables to CSV with headers', () => {
    const csv = exportComparablesCsv(sampleListings.slice(0, 1))

    expect(csv).toContain('title')
    expect(csv).toContain('"Bright terrace studio near old town"')
  })

  it('serializes comparables to JSON', () => {
    const json = exportComparablesJson(sampleListings.slice(0, 1))
    const parsed = JSON.parse(json) as Array<{ title: string; priceNightly: number }>

    expect(parsed[0]?.title).toBe('Bright terrace studio near old town')
    expect(parsed[0]?.priceNightly).toBeGreaterThan(0)
  })
})
