import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  Download,
  FileText,
  Map,
  MessageSquareText,
  Sparkles,
  Upload,
} from 'lucide-react'
import { AppHeader } from './components/AppHeader'
import { ImportInsight } from './components/ImportInsight'
import { MetricTile } from './components/MetricTile'
import { SubjectForm } from './components/SubjectForm'
import { TabBar, type TabItem } from './components/TabBar'
import {
  CalendarPanel,
  CompetitorPanel,
  CopyPanel,
  ExportPanel,
  MessagePanel,
  PricingPanel,
  ReviewPanel,
} from './components/WorkflowPanels'
import { optimizeCalendar } from './features/analysis/calendar'
import { rankCompetitors } from './features/analysis/competitors'
import { analyzePricing } from './features/analysis/pricing'
import { runDuckDbSummary, type DuckDbSummary } from './features/duckdb/duckdbSummary'
import { generateDrafts } from './features/drafts/drafts'
import { requestLocalDraft } from './features/drafts/localLlm'
import { createMarkdownReport, downloadMarkdown } from './features/export/report'
import {
  defaultSubjectListing,
  type Listing,
  type SubjectListing,
} from './features/import/listingSchema'
import { inferImport } from './features/import/inferImport'
import type { ImportResult, ImportStatus } from './features/import/importTypes'
import { sampleListings } from './features/import/sampleListings'
import { buildInfo } from './lib/build'
import { compactNumber, currency } from './lib/format'
import type { ActivityEvent } from './lib/activity'
import { useLocalState } from './lib/storage'

type WorkflowTab =
  | 'pricing'
  | 'calendar'
  | 'copy'
  | 'messages'
  | 'reviews'
  | 'competitors'
  | 'export'

const tabs: TabItem<WorkflowTab>[] = [
  { id: 'pricing', label: 'Pricing', icon: BarChart3 },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'copy', label: 'Copy', icon: FileText },
  { id: 'messages', label: 'Messages', icon: MessageSquareText },
  { id: 'reviews', label: 'Reviews', icon: ClipboardList },
  { id: 'competitors', label: 'Competitors', icon: Map },
  { id: 'export', label: 'Export', icon: Download },
]

const storageKeys = {
  listings: 'hostflow-local:listings',
  subject: 'hostflow-local:subject',
  tab: 'hostflow-local:tab',
  llmEndpoint: 'hostflow-local:llm-endpoint',
  llmModel: 'hostflow-local:llm-model',
  activity: 'hostflow-local:activity',
}

type ImportUiState = ImportStatus | 'idle' | 'parsing' | 'cancelled'

function App() {
  const [listings, setListings] = useLocalState<Listing[]>(storageKeys.listings, sampleListings)
  const [subject, setSubject] = useLocalState<SubjectListing>(
    storageKeys.subject,
    defaultSubjectListing,
  )
  const [activeTab, setActiveTab] = useLocalState<WorkflowTab>(storageKeys.tab, 'pricing')
  const [activity, setActivity] = useLocalState<ActivityEvent[]>(storageKeys.activity, [])
  const [importText, setImportText] = useState('')
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importState, setImportState] = useState<ImportUiState>('idle')
  const [notice, setNotice] = useState('Sample market loaded')
  const importPreviewTimer = useRef<number | null>(null)
  const [duckDbRows, setDuckDbRows] = useState<DuckDbSummary[]>([])
  const [duckDbStatus, setDuckDbStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [llmEndpoint, setLlmEndpoint] = useLocalState(
    storageKeys.llmEndpoint,
    'http://localhost:11434/api/generate',
  )
  const [llmModel, setLlmModel] = useLocalState(storageKeys.llmModel, 'llama3.2')
  const [llmDraft, setLlmDraft] = useState('')
  const [llmStatus, setLlmStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const debugEnabled = useMemo(
    () => new URLSearchParams(window.location.search).get('debug') === '1',
    [],
  )

  const pricing = useMemo(() => analyzePricing(listings, subject), [listings, subject])
  const calendar = useMemo(() => optimizeCalendar(pricing, subject, 30), [pricing, subject])
  const competitors = useMemo(
    () => rankCompetitors(listings, subject, pricing.recommendedTarget),
    [listings, pricing.recommendedTarget, subject],
  )
  const drafts = useMemo(
    () => generateDrafts({ subject, pricing, calendar, competitors }),
    [calendar, competitors, pricing, subject],
  )
  const markdownReport = useMemo(
    () =>
      createMarkdownReport({
        subject,
        listings,
        pricing,
        calendar,
        competitors,
        drafts,
        importResult,
        activity,
      }),
    [activity, calendar, competitors, drafts, importResult, listings, pricing, subject],
  )

  useEffect(
    () => () => {
      if (importPreviewTimer.current) {
        window.clearTimeout(importPreviewTimer.current)
      }
    },
    [],
  )

  function importListings() {
    if (importState === 'parsing') return

    const result = importResult ?? inferImport(importText)
    setImportResult(result)
    setImportState(result.status)
    setNotice(result.summary)

    if (result.marketRows.length && !result.listings.length) {
      const firstMarket = result.marketRows[0]
      setSubject({
        ...subject,
        currentRate: Math.round(firstMarket?.marketAdr || subject.currentRate),
        targetOccupancy: firstMarket?.occupancyHint || subject.targetOccupancy,
      })
    }

    if (!result.listings.length) {
      addActivity('import', result.summary, result.sourceFingerprint)
      return
    }

    setListings(result.listings)
    addActivity('import', result.summary, result.sourceFingerprint)
  }

  async function summarizeWithDuckDb() {
    if (duckDbStatus === 'loading') return
    setDuckDbStatus('loading')
    try {
      const rows = await runDuckDbSummary(listings)
      setDuckDbRows(rows)
      setDuckDbStatus('ready')
    } catch (error) {
      setDuckDbStatus('error')
      setNotice(error instanceof Error ? error.message : 'DuckDB summary failed')
    }
  }

  async function generateWithLocalLlm() {
    if (llmStatus === 'loading') return
    setLlmStatus('loading')
    try {
      const prompt = `Improve this short-term rental listing copy without inventing amenities:\n\n${drafts.listingSummary}\n\nBullets:\n${drafts.listingBullets.join('\n')}`
      const response = await requestLocalDraft({ endpoint: llmEndpoint, model: llmModel, prompt })
      setLlmDraft(response)
      setLlmStatus('ready')
    } catch (error) {
      setLlmStatus('error')
      setNotice(error instanceof Error ? error.message : 'Local LLM request failed')
    }
  }

  function addActivity(type: ActivityEvent['type'], summary: string, sourceFingerprint?: string) {
    setActivity((current) =>
      [
        {
          id: `${Date.now()}-${type}`,
          at: new Date().toISOString(),
          type,
          summary,
          sourceFingerprint,
        },
        ...current,
      ].slice(0, 12),
    )
  }

  function downloadReport() {
    addActivity(
      'export',
      `Exported report with ${listings.length} listings`,
      importResult?.sourceFingerprint,
    )
    downloadMarkdown('hostflow-local-report.md', markdownReport)
  }

  return (
    <main className="min-h-screen bg-[#edf3f1] text-[#202523]">
      <AppHeader />
      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-5 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-4">
          <section className="surface p-4">
            <div className="section-title">
              <Upload size={18} aria-hidden="true" />
              <h2>Market Import</h2>
            </div>
            <textarea
              className="field mt-3 min-h-40"
              value={importText}
              onChange={(event) => {
                const nextValue = event.target.value
                setImportText(nextValue)
                if (importPreviewTimer.current) {
                  window.clearTimeout(importPreviewTimer.current)
                }
                if (!nextValue.trim()) {
                  setImportResult(null)
                  setImportState('idle')
                  setNotice('Paste CSV or listing HTML to preview what HostFlow detected')
                  importPreviewTimer.current = null
                  return
                }

                setImportState('parsing')
                importPreviewTimer.current = window.setTimeout(() => {
                  const result = inferImport(nextValue)
                  setImportResult(result)
                  setImportState(result.status)
                  setNotice(result.summary)
                }, 180)
              }}
              placeholder="CSV or pasted listing HTML"
              aria-label="CSV or pasted listing HTML"
            />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" className="btn btn-primary" onClick={importListings}>
                {importState === 'parsing' ? 'Parsing...' : 'Parse'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  if (importPreviewTimer.current) {
                    window.clearTimeout(importPreviewTimer.current)
                    importPreviewTimer.current = null
                  }
                  setListings(sampleListings)
                  setImportResult(null)
                  setImportState('idle')
                  setNotice('Sample market loaded')
                  addActivity('sample', 'Loaded sample market')
                }}
              >
                Sample
              </button>
            </div>
            <p className="mt-3 text-sm text-[#6a6255]" role="status">
              {notice}
            </p>
          </section>

          <ImportInsight result={importResult} activity={activity} debug={debugEnabled} />

          <section className="surface p-4">
            <div className="section-title">
              <Sparkles size={18} aria-hidden="true" />
              <h2>Subject Listing</h2>
            </div>
            <SubjectForm subject={subject} onChange={setSubject} />
          </section>
        </aside>

        <section className="space-y-4">
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <MetricTile
              label="Listings"
              value={compactNumber(listings.length)}
              detail="Local dataset"
            />
            <MetricTile
              label="Target"
              value={currency(pricing.recommendedTarget)}
              detail="Base night"
            />
            <MetricTile
              label="Band"
              value={`${currency(pricing.recommendedLow)}-${currency(pricing.recommendedHigh)}`}
            />
            <MetricTile
              label="Occupancy"
              value={pricing.occupancySignal}
              detail={pricing.currentPosition}
            />
            <MetricTile
              label="Build"
              value={`v${buildInfo.version}`}
              detail={`commit ${buildInfo.commit}`}
            />
          </section>

          <section className="surface overflow-hidden">
            <TabBar items={tabs} active={activeTab} onChange={setActiveTab} />
            <div className="p-4 sm:p-5">
              {activeTab === 'pricing' ? (
                <PricingPanel
                  pricing={pricing}
                  onDuckDb={summarizeWithDuckDb}
                  duckDbRows={duckDbRows}
                  duckDbStatus={duckDbStatus}
                />
              ) : null}
              {activeTab === 'calendar' ? <CalendarPanel calendar={calendar} /> : null}
              {activeTab === 'copy' ? (
                <CopyPanel
                  drafts={drafts}
                  llmEndpoint={llmEndpoint}
                  llmModel={llmModel}
                  llmDraft={llmDraft}
                  llmStatus={llmStatus}
                  onEndpointChange={setLlmEndpoint}
                  onModelChange={setLlmModel}
                  onGenerate={generateWithLocalLlm}
                />
              ) : null}
              {activeTab === 'messages' ? <MessagePanel drafts={drafts} /> : null}
              {activeTab === 'reviews' ? <ReviewPanel drafts={drafts} /> : null}
              {activeTab === 'competitors' ? <CompetitorPanel competitors={competitors} /> : null}
              {activeTab === 'export' ? (
                <ExportPanel markdown={markdownReport} onDownload={downloadReport} />
              ) : null}
            </div>
          </section>
        </section>
      </section>
    </main>
  )
}

export default App
