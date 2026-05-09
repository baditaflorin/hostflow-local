import type { ImportResult } from './importTypes'
import { inferImport } from './inferImport'
import { stableHash } from './normalizeInput'

export type TextImportSource = {
  name: string
  text: string
}

export async function readImportFiles(files: FileList | File[]) {
  const list = Array.from(files)
  return Promise.all(
    list.map(async (file) => ({
      name: file.name,
      text: await file.text(),
    })),
  )
}

export async function fetchImportUrl(url: string) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`The server returned ${response.status}.`)
    }
    return await response.text()
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'The request failed.'
    throw new Error(
      `Could not fetch that URL in the browser. ${reason} If this page blocks cross-origin reads, open it yourself and paste the visible HTML or upload a CSV export instead.`,
      { cause: error },
    )
  }
}

export function combineImportSources(sources: TextImportSource[]): ImportResult {
  if (sources.length === 1) {
    return inferImport(sources[0]?.text ?? '')
  }

  const results = sources.map((source) => ({
    source,
    result: inferImport(source.text),
  }))

  const listings = results.flatMap((entry) => entry.result.listings)
  const marketRows = results.flatMap((entry) => entry.result.marketRows)
  const issues = results.flatMap((entry) =>
    entry.result.issues.map((issue) => ({
      ...issue,
      what: `${entry.source.name}: ${issue.what}`,
    })),
  )
  const anomalies = results.flatMap((entry) =>
    entry.result.anomalies.map((issue) => ({
      ...issue,
      what: `${entry.source.name}: ${issue.what}`,
    })),
  )
  const confidence =
    results.reduce((sum, entry) => sum + entry.result.confidence, 0) / Math.max(results.length, 1)
  const sourceBytes = results.reduce((sum, entry) => sum + entry.result.sourceBytes, 0)

  return {
    schemaVersion: 'hostflow.import.v2',
    sourceFingerprint: stableHash(results.map((entry) => entry.result.sourceFingerprint).join('|')),
    sourceBytes,
    shape: listings.length ? 'competitor_listings' : (results[0]?.result.shape ?? 'unknown'),
    platform: results.length === 1 ? results[0]?.result.platform : undefined,
    confidence,
    status: listings.length
      ? listings.length >= 10
        ? 'loaded-many'
        : 'loaded-some'
      : marketRows.length
        ? 'loaded-some'
        : issues.some((issue) => issue.severity === 'fatal-error')
          ? 'fatal-error'
          : 'loaded-empty',
    listings,
    marketRows,
    issues,
    anomalies,
    summary: `${sources.length} sources loaded: ${listings.length} comparables and ${marketRows.length} market rows detected.`,
    performanceMs: results.reduce((sum, entry) => sum + entry.result.performanceMs, 0),
  }
}
