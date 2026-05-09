import type { Listing } from './listingSchema'

export type InputShape =
  | 'competitor_listings'
  | 'ota_cards'
  | 'reservation_history'
  | 'market_benchmark'
  | 'market_calendar'
  | 'challenge_page'
  | 'json_ld'
  | 'empty'
  | 'unknown'

export type ImportStatus =
  | 'loaded-empty'
  | 'loaded-some'
  | 'loaded-many'
  | 'loaded-partial'
  | 'recoverable-error'
  | 'fatal-error'

export type IssueSeverity = 'info' | 'warning' | 'recoverable-error' | 'fatal-error'

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
