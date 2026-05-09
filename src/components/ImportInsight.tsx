import type { ImportIssue, ImportResult } from '../features/import/importTypes'
import { percent } from '../lib/format'
import type { ActivityEvent } from '../lib/activity'

export function ImportInsight({
  result,
  activity,
  debug,
}: {
  result: ImportResult | null
  activity: ActivityEvent[]
  debug: boolean
}) {
  if (!result && !activity.length) return null

  return (
    <section className="surface p-4">
      <h2 className="text-sm font-extrabold">Import Intelligence</h2>
      {result ? (
        <div className="mt-3 space-y-3">
          <div className="mini-row">
            <span>{result.shape.replace(/_/g, ' ')}</span>
            <strong>{percent(result.confidence)}</strong>
          </div>
          <p className="text-sm leading-6 text-[#46524e]">{result.summary}</p>
          {result.issues.slice(0, 4).map((issue) => (
            <IssueNote issue={issue} key={`${issue.code}-${issue.what}`} />
          ))}
          {debug ? (
            <pre className="debug-box">
              {JSON.stringify(
                {
                  fingerprint: result.sourceFingerprint,
                  bytes: result.sourceBytes,
                  status: result.status,
                  platform: result.platform,
                  performanceMs: Math.round(result.performanceMs * 100) / 100,
                  listings: result.listings.map((listing) => ({
                    id: listing.stableId,
                    title: listing.title,
                    confidence: listing.confidence,
                    fieldConfidence: listing.fieldConfidence,
                    reasons: listing.fieldReasons,
                    issues: listing.issues.map((item) => item.code),
                  })),
                  marketRows: result.marketRows,
                  issues: result.issues,
                },
                null,
                2,
              )}
            </pre>
          ) : null}
        </div>
      ) : null}
      {activity.length ? (
        <div className="mt-4">
          <h3 className="text-xs font-extrabold uppercase text-[#52625d]">Activity</h3>
          <ol className="mt-2 space-y-2 text-xs leading-5 text-[#46524e]">
            {activity.slice(0, 4).map((event) => (
              <li key={event.id}>
                <strong>{event.type}</strong> · {event.summary}
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  )
}

function IssueNote({ issue }: { issue: ImportIssue }) {
  return (
    <div className="issue-note" data-severity={issue.severity}>
      <strong>{issue.what}</strong>
      <span>{issue.why}</span>
      <em>{issue.nowWhat}</em>
    </div>
  )
}
