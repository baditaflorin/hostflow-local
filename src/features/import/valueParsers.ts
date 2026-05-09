import type { FieldInference, ImportIssue } from './importTypes'

const currencyBySymbol: Record<string, string> = {
  $: 'USD',
  '€': 'EUR',
  '£': 'GBP',
}

export function parseNumber(value: string | number | undefined) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (!value) return 0

  const compact = value
    .replace(/\u00a0/g, ' ')
    .replace(/[^\d,.\- ]/g, '')
    .trim()
    .replace(/\s+/g, '')

  if (!compact) return 0

  const commaCount = (compact.match(/,/g) ?? []).length
  const dotCount = (compact.match(/\./g) ?? []).length

  let normalized = compact
  if (commaCount && dotCount) {
    normalized =
      compact.lastIndexOf(',') > compact.lastIndexOf('.')
        ? compact.replace(/\./g, '').replace(',', '.')
        : compact.replace(/,/g, '')
  } else if (commaCount === 1 && /^\d+,\d{1,2}$/.test(compact)) {
    normalized = compact.replace(',', '.')
  } else if (commaCount > 0) {
    normalized = compact.replace(/,/g, '')
  }

  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

export function parsePercent(value: string | number | undefined) {
  const parsed = parseNumber(value)
  return parsed > 1 ? parsed / 100 : parsed
}

export function inferPrice(text: string): {
  nightly?: FieldInference<number>
  total?: FieldInference<number>
  currency?: FieldInference<string>
  nights?: FieldInference<number>
  issues: ImportIssue[]
} {
  const issues: ImportIssue[] = []
  const candidates = Array.from(
    text.matchAll(/([$€£])\s*([\d][\d.,\s]*)|([\d][\d.,\s]*)\s*(USD|EUR|GBP|RON|[$€£])/gi),
  ).map((match) => {
    const rawAmount = match[2] ?? match[3] ?? ''
    const rawCurrency = match[1] ?? match[4] ?? ''
    const start = match.index ?? 0
    const context = text.slice(
      Math.max(0, start - 36),
      Math.min(text.length, start + match[0].length + 48),
    )
    return {
      amount: parseNumber(rawAmount),
      currency: currencyBySymbol[rawCurrency] ?? rawCurrency.toUpperCase(),
      context,
    }
  })

  const nightsMatch = text.match(/(?:for|over)\s+(\d+)\s+nights?|(\d+)\s*nights?/i)
  const nights = nightsMatch
    ? {
        value: parseNumber(nightsMatch[1] ?? nightsMatch[2]),
        confidence: 0.88,
        reason: 'Detected stay length from nearby nights text.',
        source: 'text-pattern',
      }
    : undefined

  const nightlyCandidate = candidates.find((candidate) =>
    /per\s+night|\/\s*night|nightly|\bnight\b/i.test(
      candidate.context.replace(/for\s+\d+\s+nights?/i, ''),
    ),
  )
  const totalCandidate = candidates.find((candidate) =>
    /total|for\s+\d+\s+nights?/i.test(candidate.context),
  )
  const first = candidates[0]

  if (!first) return { issues }

  const currency = {
    value: (nightlyCandidate ?? totalCandidate ?? first).currency || 'USD',
    confidence: (nightlyCandidate ?? totalCandidate ?? first).currency ? 0.9 : 0.45,
    reason: (nightlyCandidate ?? totalCandidate ?? first).currency
      ? 'Detected currency from symbol or code.'
      : 'No currency found; assumed USD.',
    source: 'money-pattern',
  }

  if (!currency.confidence || currency.confidence < 0.5) {
    issues.push(
      issue(
        'currency_assumed',
        'info',
        'Currency was not explicit.',
        'The pasted value looked like a price but did not include a currency.',
        'Verify the currency before using recommendations.',
      ),
    )
  }

  if (nightlyCandidate) {
    if (totalCandidate) {
      issues.push(
        issue(
          'total_and_nightly_price_present',
          'info',
          'Total and nightly prices were both present.',
          'Host sites often show both values in one card.',
          'Used the explicit nightly rate and preserved the total price for provenance.',
        ),
      )
    }
    return {
      nightly: {
        value: nightlyCandidate.amount,
        confidence: 0.93,
        reason: 'Preferred explicit nightly/per-night price over total stay price.',
        source: 'money-context',
      },
      total: totalCandidate
        ? {
            value: totalCandidate.amount,
            confidence: 0.85,
            reason: 'Detected total stay price from nearby total/nights text.',
            source: 'money-context',
          }
        : undefined,
      currency,
      nights,
      issues,
    }
  }

  if (totalCandidate && nights?.value) {
    issues.push(
      issue(
        'total_price_divided_by_nights',
        'info',
        'Nightly rate was derived from total stay price.',
        'The card showed a total stay price and a night count.',
        'Verify fees/taxes if you need a pure base nightly rate.',
      ),
    )
    return {
      nightly: {
        value: Math.round((totalCandidate.amount / nights.value) * 100) / 100,
        confidence: 0.76,
        reason: 'Divided total stay price by detected number of nights.',
        source: 'money-context',
      },
      total: {
        value: totalCandidate.amount,
        confidence: 0.86,
        reason: 'Detected total stay price from nearby total/nights text.',
        source: 'money-context',
      },
      currency,
      nights,
      issues,
    }
  }

  return {
    nightly: {
      value: first.amount,
      confidence: 0.52,
      reason: 'Only one price-like value was found; treated as nightly with low confidence.',
      source: 'money-pattern',
    },
    currency,
    issues: [
      ...issues,
      issue(
        'price_period_unclear',
        'warning',
        'Price period was unclear.',
        'The pasted text did not say whether the price is nightly or total.',
        'Verify the nightly rate before trusting pricing recommendations.',
      ),
    ],
  }
}

export function inferRating(text: string) {
  const booking = text.match(/scored\s+(\d+(?:[.,]\d+)?)/i)
  if (booking) {
    return {
      value: Math.round((parseNumber(booking[1]) / 2) * 100) / 100,
      confidence: 0.78,
      reason: 'Converted Booking-style 10-point score to a 5-point comparable rating.',
      source: 'booking-score',
      issue: issue(
        'rating_scale_normalized',
        'info',
        'Rating scale was normalized.',
        'Booking-style scores use a 10-point scale.',
        'Compare with Airbnb/Vrbo ratings as an approximate 5-point score.',
      ),
    }
  }

  const rating = text.match(/(\d(?:[.,]\d+)?)\s*(?:stars?|rating|★|exceptional|reviews?)/i)
  return rating
    ? {
        value: parseNumber(rating[1]),
        confidence: 0.75,
        reason: 'Detected rating from nearby rating/review text.',
        source: 'rating-pattern',
      }
    : undefined
}

export function issue(
  code: string,
  severity: ImportIssue['severity'],
  what: string,
  why: string,
  nowWhat: string,
): ImportIssue {
  return { code, severity, what, why, nowWhat }
}
