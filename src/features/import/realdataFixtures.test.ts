/* @vitest-environment happy-dom */
import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { inferImport } from './inferImport'

type ExpectedFixture = {
  shape: string
  platform?: string
  useful: boolean
  minListings: number
  marketRows?: number
  mustInfer: Record<string, string | number>
  mustWarnAbout: string[]
  actionableMessageIncludes?: string[]
  minimumConfidence: number
}

const fixtureDir = join(process.cwd(), 'test/fixtures/realdata')
const inputFiles = readdirSync(fixtureDir)
  .filter((file) => !file.endsWith('.expected.json'))
  .toSorted()

describe('real-data import fixtures', () => {
  inputFiles.forEach((file) => {
    it(`infers ${file}`, () => {
      const input = readFileSync(join(fixtureDir, file), 'utf8')
      const expected = JSON.parse(
        readFileSync(join(fixtureDir, file.replace(/\.[^.]+$/, '.expected.json')), 'utf8'),
      ) as ExpectedFixture

      const result = inferImport(input)
      const first = result.listings[0]
      const issueCodes = result.issues.concat(first?.issues ?? []).map((issue) => issue.code)

      expect(result.shape).toBe(expected.shape)
      if (expected.platform) expect(result.platform ?? first?.platform).toBe(expected.platform)
      expect(result.confidence).toBeGreaterThanOrEqual(expected.minimumConfidence)
      expect(result.listings.length).toBeGreaterThanOrEqual(expected.minListings)
      if (expected.marketRows !== undefined)
        expect(result.marketRows).toHaveLength(expected.marketRows)

      Object.entries(expected.mustInfer).forEach(([field, value]) => {
        const actual =
          first?.[field as keyof typeof first] ??
          result.marketRows[0]?.[field as keyof (typeof result.marketRows)[number]]
        expect(actual).toBe(value)
      })

      expected.mustWarnAbout.forEach((code) => {
        expect(issueCodes).toContain(code)
      })

      expected.actionableMessageIncludes?.forEach((text) => {
        expect(result.summary.toLowerCase()).toContain(text.toLowerCase())
      })
    })
  })

  it('is deterministic for normalized fixture output', () => {
    inputFiles.forEach((file) => {
      const input = readFileSync(join(fixtureDir, file), 'utf8')
      const first = JSON.stringify(normalizedResult(inferImport(input)))
      const second = JSON.stringify(normalizedResult(inferImport(input)))
      expect(second).toBe(first)
    })
  })
})

function normalizedResult(result: ReturnType<typeof inferImport>) {
  return {
    sourceFingerprint: result.sourceFingerprint,
    shape: result.shape,
    platform: result.platform,
    confidence: result.confidence,
    status: result.status,
    listings: result.listings.map((listing) => ({
      stableId: listing.stableId,
      title: listing.title,
      priceNightly: listing.priceNightly,
      priceTotal: listing.priceTotal,
      currency: listing.currency,
      guests: listing.guests,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      rating: listing.rating,
      reviewCount: listing.reviewCount,
      confidence: listing.confidence,
    })),
    marketRows: result.marketRows,
    issueCodes: result.issues.map((issue) => issue.code),
  }
}
