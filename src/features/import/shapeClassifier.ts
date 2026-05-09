import type { CsvTable, InputShape, ImportIssue } from './importTypes'
import { looksTabular, parseCsvTable } from './csvParser'
import { mapHeaders } from './fieldMap'
import { issue } from './valueParsers'

export type ShapeClassification = {
  shape: InputShape
  platform?: string
  confidence: number
  table?: CsvTable
  issues: ImportIssue[]
}

export function classifyInput(text: string): ShapeClassification {
  const trimmed = text.trim()
  if (!trimmed) {
    return {
      shape: 'empty',
      confidence: 1,
      issues: [
        issue(
          'empty_input',
          'recoverable-error',
          'No import data was provided.',
          'The import box is empty.',
          'Paste listing cards or a CSV export, or load the sample market.',
        ),
      ],
    }
  }

  if (isChallengePage(trimmed)) {
    return {
      shape: 'challenge_page',
      platform: detectPlatform(trimmed),
      confidence: 0.98,
      issues: [
        issue(
          'challenge_page_detected',
          'recoverable-error',
          'This is not a rendered listing page.',
          'The pasted HTML is a login, bot-check, or challenge page rather than visible property cards.',
          'Open the page in your browser, copy the visible cards, or import a CSV export.',
        ),
      ],
    }
  }

  if (looksTabular(trimmed)) {
    const table = parseCsvTable(trimmed)
    if (table) return classifyTable(table)
  }

  if (/<script[^>]+application\/ld\+json/i.test(trimmed)) {
    return { shape: 'json_ld', platform: detectPlatform(trimmed), confidence: 0.82, issues: [] }
  }

  if (/<[a-z][\s\S]*>/i.test(trimmed)) {
    return { shape: 'ota_cards', platform: detectPlatform(trimmed), confidence: 0.8, issues: [] }
  }

  return {
    shape: 'unknown',
    confidence: 0.35,
    issues: [
      issue(
        'unknown_input_shape',
        'recoverable-error',
        'The pasted data was not recognized as host data.',
        'It did not look like listing cards, a reservation export, a market benchmark, or a market calendar.',
        'Paste visible property cards or a CSV with listing, price, guests, and rating columns.',
      ),
    ],
  }
}

function classifyTable(table: CsvTable): ShapeClassification {
  const { fields, normalizedHeaders } = mapHeaders(table.headers)
  const has = (name: string) => fields.has(name)
  const issues: ImportIssue[] = []

  if (table.delimiter !== ',') {
    issues.push(
      issue(
        'delimiter_inferred',
        'info',
        'CSV delimiter was inferred.',
        `The file uses "${table.delimiter}" instead of a comma.`,
        'No action needed unless the columns look shifted.',
      ),
    )
  }

  if (has('date') && (has('marketAdr') || has('occupancyHint'))) {
    return { shape: 'market_calendar', platform: 'pricelabs', confidence: 0.88, table, issues }
  }

  if (has('totalPrice') || normalizedHeaders.includes('total_price')) {
    if (has('checkin') || has('checkout') || has('nights')) {
      return {
        shape: 'reservation_history',
        platform: platformFromHeaders(table),
        confidence: 0.84,
        table,
        issues,
      }
    }
  }

  if (has('annualRevenue') || has('marketAdr') || normalizedHeaders.includes('comp_set_listings')) {
    return { shape: 'market_benchmark', platform: 'pricelabs', confidence: 0.84, table, issues }
  }

  if (has('priceNightly') || has('title') || has('guests')) {
    return { shape: 'competitor_listings', confidence: 0.78, table, issues }
  }

  return {
    shape: 'unknown',
    confidence: 0.4,
    table,
    issues: [
      ...issues,
      issue(
        'csv_shape_unknown',
        'recoverable-error',
        'The CSV columns were not recognized.',
        'The headers do not match listings, reservations, market benchmarks, or market calendar exports.',
        'Keep the data and add columns like title, price, guests, or average_daily_rate.',
      ),
    ],
  }
}

function isChallengePage(text: string) {
  return /challenge-container|awsWafCookieDomainList|__challenge|captcha|bot check|access denied/i.test(
    text,
  )
}

export function detectPlatform(text: string) {
  if (/booking\.com|data-testid="property-card"|Scored\s+\d/i.test(text)) return 'booking'
  if (/airbnb|\/rooms\/|guest favorite/i.test(text)) return 'airbnb'
  if (/vrbo|sleeps\s+\d|exceptional/i.test(text)) return 'vrbo'
  if (/pricelabs/i.test(text)) return 'pricelabs'
  return undefined
}

function platformFromHeaders(table: CsvTable) {
  const sourceIndex = table.headers.findIndex((header) => /platform|source/i.test(header))
  const source = sourceIndex >= 0 ? table.rows[0]?.[sourceIndex]?.toLowerCase() : ''
  if (source?.includes('airbnb')) return 'airbnb'
  if (source?.includes('booking')) return 'booking'
  if (source?.includes('vrbo')) return 'vrbo'
  return undefined
}
