import { useMemo, useState } from 'react'
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
import { parseListings } from './features/import/parseListings'
import { sampleListings } from './features/import/sampleListings'
import { buildInfo } from './lib/build'
import { compactNumber, currency } from './lib/format'
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
}

function App() {
  const [listings, setListings] = useLocalState<Listing[]>(storageKeys.listings, sampleListings)
  const [subject, setSubject] = useLocalState<SubjectListing>(
    storageKeys.subject,
    defaultSubjectListing,
  )
  const [activeTab, setActiveTab] = useLocalState<WorkflowTab>(storageKeys.tab, 'pricing')
  const [importText, setImportText] = useState('')
  const [notice, setNotice] = useState('Sample market loaded')
  const [duckDbRows, setDuckDbRows] = useState<DuckDbSummary[]>([])
  const [duckDbStatus, setDuckDbStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [llmEndpoint, setLlmEndpoint] = useLocalState(
    storageKeys.llmEndpoint,
    'http://localhost:11434/api/generate',
  )
  const [llmModel, setLlmModel] = useLocalState(storageKeys.llmModel, 'llama3.2')
  const [llmDraft, setLlmDraft] = useState('')
  const [llmStatus, setLlmStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')

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
    () => createMarkdownReport({ subject, listings, pricing, calendar, competitors, drafts }),
    [calendar, competitors, drafts, listings, pricing, subject],
  )

  function importListings() {
    const parsed = parseListings(importText)
    if (!parsed.length) {
      setNotice('No listings found. Try CSV with title, price, bedrooms, guests, rating headers.')
      return
    }
    setListings(parsed)
    setNotice(`${parsed.length} imported listing${parsed.length === 1 ? '' : 's'} parsed locally`)
  }

  async function summarizeWithDuckDb() {
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

  return (
    <main className="min-h-screen bg-[#f7f5ee] text-[#211f1b]">
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
              onChange={(event) => setImportText(event.target.value)}
              placeholder="CSV or pasted listing HTML"
              aria-label="CSV or pasted listing HTML"
            />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" className="btn btn-primary" onClick={importListings}>
                Parse
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setListings(sampleListings)
                  setNotice('Sample market loaded')
                }}
              >
                Sample
              </button>
            </div>
            <p className="mt-3 text-sm text-[#6a6255]" role="status">
              {notice}
            </p>
          </section>

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
                <ExportPanel
                  markdown={markdownReport}
                  onDownload={() => downloadMarkdown('hostflow-local-report.md', markdownReport)}
                />
              ) : null}
            </div>
          </section>
        </section>
      </section>
    </main>
  )
}

export default App
