import { z } from 'zod'
import type { Listing } from './listingSchema'

export const inputShapeSchema = z.enum([
  'competitor_listings',
  'ota_cards',
  'reservation_history',
  'market_benchmark',
  'market_calendar',
  'challenge_page',
  'json_ld',
  'empty',
  'unknown',
])

export type InputShape = z.infer<typeof inputShapeSchema>

export const importStatusSchema = z.enum([
  'loaded-empty',
  'loaded-some',
  'loaded-many',
  'loaded-partial',
  'recoverable-error',
  'fatal-error',
])

export type ImportStatus = z.infer<typeof importStatusSchema>

export const issueSeveritySchema = z.enum(['info', 'warning', 'recoverable-error', 'fatal-error'])

export type IssueSeverity = z.infer<typeof issueSeveritySchema>

export const importIssueSchema = z.object({
  code: z.string(),
  severity: issueSeveritySchema,
  what: z.string(),
  why: z.string(),
  nowWhat: z.string(),
  row: z.number().optional(),
  field: z.string().optional(),
})

export type ImportIssue = {
  code: string
  severity: IssueSeverity
  what: string
  why: string
  nowWhat: string
  row?: number
  field?: string
}

export type FieldInference<T = unknown> = {
  value: T
  confidence: number
  reason: string
  source: string
}

export type InferredListing = Listing & {
  stableId: string
  sourceShape: InputShape
  platform?: string
  currency?: string
  priceTotal?: number
  confidence: number
  fieldConfidence: Record<string, number>
  fieldReasons: Record<string, string>
  issues: ImportIssue[]
}

export const inferredListingSchema = z.object({
  id: z.string(),
  title: z.string(),
  location: z.string(),
  neighborhood: z.string(),
  url: z.string().optional(),
  priceNightly: z.number().nonnegative(),
  cleaningFee: z.number().nonnegative(),
  bedrooms: z.number().nonnegative(),
  bathrooms: z.number().nonnegative(),
  guests: z.number().positive(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().nonnegative(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  amenities: z.array(z.string()),
  minNights: z.number().positive(),
  occupancyHint: z.number().min(0).max(1),
  source: z.enum(['sample', 'html', 'csv', 'manual']),
  stableId: z.string(),
  sourceShape: inputShapeSchema,
  platform: z.string().optional(),
  currency: z.string().optional(),
  priceTotal: z.number().optional(),
  confidence: z.number(),
  fieldConfidence: z.record(z.string(), z.number()),
  fieldReasons: z.record(z.string(), z.string()),
  issues: z.array(importIssueSchema),
})

export type MarketCalendarRow = {
  date: string
  marketAdr: number
  occupancyHint: number
  bookingWindow?: number
  lengthOfStay?: number
  confidence: number
}

export type ImportResult = {
  schemaVersion: 'hostflow.import.v2'
  sourceFingerprint: string
  sourceBytes: number
  shape: InputShape
  platform?: string
  confidence: number
  status: ImportStatus
  listings: InferredListing[]
  marketRows: MarketCalendarRow[]
  issues: ImportIssue[]
  anomalies: ImportIssue[]
  summary: string
  performanceMs: number
}

export type CsvTable = {
  delimiter: string
  headers: string[]
  rows: string[][]
}
