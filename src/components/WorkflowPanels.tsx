import { Copy, Database, Download, Printer, Share2, Sparkles } from 'lucide-react'
import { optimizeCalendar } from '../features/analysis/calendar'
import { rankCompetitors } from '../features/analysis/competitors'
import { analyzePricing } from '../features/analysis/pricing'
import type { DuckDbSummary } from '../features/duckdb/duckdbSummary'
import { generateDrafts } from '../features/drafts/drafts'
import { currency, percent } from '../lib/format'
import { MetricTile } from './MetricTile'

export function PricingPanel({
  pricing,
  onDuckDb,
  duckDbRows,
  duckDbStatus,
}: {
  pricing: ReturnType<typeof analyzePricing>
  onDuckDb: () => void
  duckDbRows: DuckDbSummary[]
  duckDbStatus: 'idle' | 'loading' | 'ready' | 'error'
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricTile label="Median" value={currency(pricing.medianPrice)} />
          <MetricTile label="Average" value={currency(pricing.averagePrice)} />
          <MetricTile label="Confidence" value={percent(pricing.confidence)} />
        </div>
        <div className="content-panel">
          <h3>Recommendation Logic</h3>
          <ul className="clean-list">
            {pricing.explanation.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="content-panel">
        <div className="section-title">
          <Database size={18} aria-hidden="true" />
          <h3>DuckDB Summary</h3>
        </div>
        <button type="button" className="btn btn-secondary mt-3 w-full" onClick={onDuckDb}>
          {duckDbStatus === 'loading' ? 'Running...' : 'Run SQL Summary'}
        </button>
        <div className="mt-3 space-y-2">
          {duckDbRows.map((row) => (
            <div className="mini-row" key={row.neighborhood}>
              <span>{row.neighborhood}</span>
              <strong>{currency(row.averageRate)}</strong>
            </div>
          ))}
          {duckDbStatus === 'error' ? (
            <p className="text-sm text-[#9b2c2c]">DuckDB did not initialize.</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function CalendarPanel({ calendar }: { calendar: ReturnType<typeof optimizeCalendar> }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Rate</th>
            <th>Min</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {calendar.map((day) => (
            <tr key={day.date}>
              <td>
                {day.dayName} {day.date}
              </td>
              <td>{currency(day.rate)}</td>
              <td>{day.minNights}</td>
              <td>{day.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function CopyPanel({
  drafts,
  llmDraft,
  llmStatus,
  onGenerate,
  onCopy,
}: {
  drafts: ReturnType<typeof generateDrafts>
  llmDraft: string
  llmStatus: 'idle' | 'loading' | 'ready' | 'error'
  onGenerate: () => void
  onCopy: (label: string, value: string) => void
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <div className="content-panel">
          <div className="flex items-center justify-between gap-3">
            <h3>Title Options</h3>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onCopy('Title options', drafts.listingTitleOptions.join('\n'))}
            >
              <Copy size={16} aria-hidden="true" />
              Copy
            </button>
          </div>
          <ul className="clean-list">
            {drafts.listingTitleOptions.map((title) => (
              <li key={title}>{title}</li>
            ))}
          </ul>
        </div>
        <TextBlock
          title="Listing Summary"
          body={drafts.listingSummary}
          onCopy={() => onCopy('Listing summary', drafts.listingSummary)}
        />
        <div className="content-panel">
          <div className="flex items-center justify-between gap-3">
            <h3>Listing Bullets</h3>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onCopy('Listing bullets', drafts.listingBullets.join('\n'))}
            >
              <Copy size={16} aria-hidden="true" />
              Copy
            </button>
          </div>
          <ul className="clean-list">
            {drafts.listingBullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="content-panel">
        <div className="section-title">
          <Sparkles size={18} aria-hidden="true" />
          <h3>Local LLM</h3>
        </div>
        <button type="button" className="btn btn-secondary mt-3 w-full" onClick={onGenerate}>
          {llmStatus === 'loading' ? 'Generating...' : 'Polish Copy'}
        </button>
        {llmDraft ? (
          <div className="mt-3 space-y-3">
            <button
              type="button"
              className="btn btn-secondary w-full"
              onClick={() => onCopy('Local LLM draft', llmDraft)}
            >
              <Copy size={16} aria-hidden="true" />
              Copy draft
            </button>
            <p className="whitespace-pre-wrap text-sm leading-6">{llmDraft}</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function MessagePanel({
  drafts,
  onCopy,
}: {
  drafts: ReturnType<typeof generateDrafts>
  onCopy: (label: string, value: string) => void
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {drafts.guestTemplates.map((template) => (
        <TextBlock
          key={template.title}
          title={template.title}
          body={template.body}
          onCopy={() => onCopy(template.title, template.body)}
        />
      ))}
    </div>
  )
}

export function ReviewPanel({
  drafts,
  onCopy,
}: {
  drafts: ReturnType<typeof generateDrafts>
  onCopy: (label: string, value: string) => void
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {drafts.reviewResponses.map((response) => (
        <TextBlock
          key={response.tone}
          title={response.tone}
          body={response.body}
          onCopy={() => onCopy(`${response.tone} review response`, response.body)}
        />
      ))}
    </div>
  )
}

export function CompetitorPanel({
  competitors,
}: {
  competitors: ReturnType<typeof rankCompetitors>
}) {
  return (
    <div className="grid gap-3">
      {competitors.slice(0, 10).map((competitor) => (
        <article className="content-panel" key={competitor.listing.id}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3>{competitor.listing.title}</h3>
              <p className="text-sm text-[#6a6255]">
                {competitor.listing.neighborhood} · {currency(competitor.listing.priceNightly)} ·
                score {competitor.score}
              </p>
            </div>
            <strong className={competitor.priceDelta > 0 ? 'text-[#0f6b5f]' : 'text-[#9b2c2c]'}>
              {currency(competitor.priceDelta)}
            </strong>
          </div>
          <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
            <p>Strengths: {competitor.strengths.join(', ')}</p>
            <p>Openings: {competitor.opportunities.join(', ')}</p>
          </div>
        </article>
      ))}
    </div>
  )
}

export function ExportPanel({
  markdown,
  onDownloadMarkdown,
  onCopyMarkdown,
  onDownloadWorkspace,
  onDownloadCsv,
  onDownloadJson,
  onShare,
  onPrint,
}: {
  markdown: string
  onDownloadMarkdown: () => void
  onCopyMarkdown: () => void
  onDownloadWorkspace: () => void
  onDownloadCsv: () => void
  onDownloadJson: () => void
  onShare: () => void
  onPrint: () => void
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_260px]">
      <textarea
        className="field min-h-96 font-mono text-xs"
        value={markdown}
        readOnly
        aria-label="Markdown report"
      />
      <div className="content-panel">
        <h3>Pandoc-ready Markdown</h3>
        <div className="mt-3 grid gap-2">
          <button type="button" className="btn btn-primary w-full" onClick={onDownloadMarkdown}>
            <Download size={16} aria-hidden="true" />
            Download .md
          </button>
          <button type="button" className="btn btn-secondary w-full" onClick={onCopyMarkdown}>
            <Copy size={16} aria-hidden="true" />
            Copy markdown
          </button>
          <button type="button" className="btn btn-secondary w-full" onClick={onDownloadWorkspace}>
            <Download size={16} aria-hidden="true" />
            Save workspace
          </button>
          <button type="button" className="btn btn-secondary w-full" onClick={onDownloadCsv}>
            <Download size={16} aria-hidden="true" />
            Export comps CSV
          </button>
          <button type="button" className="btn btn-secondary w-full" onClick={onDownloadJson}>
            <Download size={16} aria-hidden="true" />
            Export comps JSON
          </button>
          <button type="button" className="btn btn-secondary w-full" onClick={onShare}>
            <Share2 size={16} aria-hidden="true" />
            Copy share link
          </button>
          <button type="button" className="btn btn-secondary w-full" onClick={onPrint}>
            <Printer size={16} aria-hidden="true" />
            Print report
          </button>
        </div>
        <p className="mt-3 text-sm text-[#6a6255]">
          Convert locally with Pandoc when PDF, DOCX, or HTML output is needed.
        </p>
      </div>
    </div>
  )
}

export function SettingsPanel({
  llmEndpoint,
  llmModel,
  includeActivityInExports,
  debugVisible,
  onEndpointChange,
  onModelChange,
  onIncludeActivityChange,
  onDebugVisibleChange,
  onReset,
}: {
  llmEndpoint: string
  llmModel: string
  includeActivityInExports: boolean
  debugVisible: boolean
  onEndpointChange: (value: string) => void
  onModelChange: (value: string) => void
  onIncludeActivityChange: (value: boolean) => void
  onDebugVisibleChange: (value: boolean) => void
  onReset: () => void
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_280px]">
      <div className="content-panel space-y-3">
        <h3>Local LLM defaults</h3>
        <input
          className="field"
          value={llmEndpoint}
          onChange={(event) => onEndpointChange(event.target.value)}
          aria-label="Local LLM endpoint"
        />
        <input
          className="field"
          value={llmModel}
          onChange={(event) => onModelChange(event.target.value)}
          aria-label="Local LLM model"
        />
      </div>
      <div className="content-panel space-y-3">
        <h3>Workspace behavior</h3>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={includeActivityInExports}
            onChange={(event) => onIncludeActivityChange(event.target.checked)}
          />
          <span>Include activity history in exports</span>
        </label>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={debugVisible}
            onChange={(event) => onDebugVisibleChange(event.target.checked)}
          />
          <span>Always show import debug details</span>
        </label>
        <button type="button" className="btn btn-secondary w-full" onClick={onReset}>
          Start fresh
        </button>
      </div>
    </div>
  )
}

function TextBlock({ title, body, onCopy }: { title: string; body: string; onCopy?: () => void }) {
  return (
    <article className="content-panel">
      <div className="flex items-center justify-between gap-3">
        <h3>{title}</h3>
        {onCopy ? (
          <button type="button" className="btn btn-secondary" onClick={onCopy}>
            <Copy size={16} aria-hidden="true" />
            Copy
          </button>
        ) : null}
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#4f493e]">{body}</p>
    </article>
  )
}
