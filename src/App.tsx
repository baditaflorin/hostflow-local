import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  BarChart3,
  CalendarDays,
  Clipboard,
  ClipboardList,
  Download,
  FileText,
  FolderUp,
  Map,
  MessageSquareText,
  Settings2,
  Sparkles,
  Trash2,
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
  SettingsPanel,
} from './components/WorkflowPanels'
import { optimizeCalendar } from './features/analysis/calendar'
import { rankCompetitors } from './features/analysis/competitors'
import { analyzePricing } from './features/analysis/pricing'
import { runDuckDbSummary, type DuckDbSummary } from './features/duckdb/duckdbSummary'
import { generateDrafts } from './features/drafts/drafts'
import { requestLocalDraft } from './features/drafts/localLlm'
import { createMarkdownReport } from './features/export/report'
import { exportComparablesCsv, exportComparablesJson } from './features/export/structured'
import {
  combineImportSources,
  fetchImportUrl,
  readImportFiles,
} from './features/import/importSource'
import {
  defaultSubjectListing,
  type Listing,
  type SubjectListing,
} from './features/import/listingSchema'
import { inferImport } from './features/import/inferImport'
import type { ImportResult, ImportStatus } from './features/import/importTypes'
import { sampleListings } from './features/import/sampleListings'
import { readClipboardText, copyText } from './lib/clipboard'
import { buildInfo } from './lib/build'
import { downloadText, printTextDocument } from './lib/download'
import { compactNumber, currency } from './lib/format'
import type { ActivityEvent } from './lib/activity'
import { useLocalState } from './lib/storage'
import {
  createResetActivity,
  decodeWorkspaceHash,
  defaultWorkspacePreferences,
  encodeWorkspaceHash,
  looksLikeWorkspaceExport,
  parseWorkspaceExport,
  serializeWorkspace,
  type WorkspacePreferences,
  type WorkspaceSnapshot,
  type WorkspaceTab,
  workspaceForShare,
} from './lib/workspace'

const tabs: TabItem<WorkspaceTab>[] = [
  { id: 'pricing', label: 'Pricing', icon: BarChart3 },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'copy', label: 'Copy', icon: FileText },
  { id: 'messages', label: 'Messages', icon: MessageSquareText },
  { id: 'reviews', label: 'Reviews', icon: ClipboardList },
  { id: 'competitors', label: 'Competitors', icon: Map },
  { id: 'export', label: 'Export', icon: Download },
  { id: 'settings', label: 'Settings', icon: Settings2 },
]

const storageKeys = {
  listings: 'hostflow-local:listings',
  subject: 'hostflow-local:subject',
  tab: 'hostflow-local:tab',
  llmEndpoint: 'hostflow-local:llm-endpoint',
  llmModel: 'hostflow-local:llm-model',
  activity: 'hostflow-local:activity',
  importText: 'hostflow-local:import-text',
  preferences: 'hostflow-local:preferences',
}

type ImportUiState = ImportStatus | 'idle' | 'parsing'

function App() {
  const [listings, setListings] = useLocalState<Listing[]>(storageKeys.listings, sampleListings)
  const [subject, setSubject] = useLocalState<SubjectListing>(
    storageKeys.subject,
    defaultSubjectListing,
  )
  const [activeTab, setActiveTab] = useLocalState<WorkspaceTab>(storageKeys.tab, 'pricing')
  const [activity, setActivity] = useLocalState<ActivityEvent[]>(storageKeys.activity, [])
  const [importText, setImportText] = useLocalState(storageKeys.importText, '')
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importState, setImportState] = useState<ImportUiState>('idle')
  const [notice, setNotice] = useState('Sample market loaded')
  const importPreviewTimer = useRef<number | null>(null)
  const didBootstrapImport = useRef(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [dropActive, setDropActive] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [duckDbRows, setDuckDbRows] = useState<DuckDbSummary[]>([])
  const [duckDbStatus, setDuckDbStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [llmEndpoint, setLlmEndpoint] = useLocalState(
    storageKeys.llmEndpoint,
    'http://localhost:11434/api/generate',
  )
  const [llmModel, setLlmModel] = useLocalState(storageKeys.llmModel, 'llama3.2')
  const [llmDraft, setLlmDraft] = useState('')
  const [llmStatus, setLlmStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [preferences, setPreferences] = useLocalState<WorkspacePreferences>(
    storageKeys.preferences,
    defaultWorkspacePreferences,
  )
  const debugEnabled = useMemo(
    () =>
      preferences.debugVisible || new URLSearchParams(window.location.search).get('debug') === '1',
    [preferences.debugVisible],
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
        activity: preferences.includeActivityInExports ? activity : [],
      }),
    [
      activity,
      calendar,
      competitors,
      drafts,
      importResult,
      listings,
      preferences.includeActivityInExports,
      pricing,
      subject,
    ],
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
    applyImportResult(result, result.summary)
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

  const addActivity = useCallback(
    (type: ActivityEvent['type'], summary: string, sourceFingerprint?: string) => {
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
    },
    [setActivity],
  )

  const clearImportPreview = useCallback(
    (nextNotice: string) => {
      if (importPreviewTimer.current) {
        window.clearTimeout(importPreviewTimer.current)
        importPreviewTimer.current = null
      }
      setImportText('')
      setImportResult(null)
      setImportState('idle')
      setNotice(nextNotice)
    },
    [setImportText],
  )

  const scheduleImportPreview = useCallback(
    (nextValue: string) => {
      if (importPreviewTimer.current) {
        window.clearTimeout(importPreviewTimer.current)
      }
      if (!nextValue.trim()) {
        clearImportPreview('Paste CSV or listing HTML to preview what HostFlow detected')
        return
      }

      setImportText(nextValue)
      setImportState('parsing')
      importPreviewTimer.current = window.setTimeout(() => {
        const result = inferImport(nextValue)
        setImportResult(result)
        setImportState(result.status)
        setNotice(result.summary)
      }, 180)
    },
    [clearImportPreview, setImportText],
  )

  const applyWorkspaceSnapshot = useCallback(
    (snapshot: WorkspaceSnapshot, successNote: string) => {
      setListings(snapshot.listings)
      setSubject(snapshot.subject)
      setActiveTab(snapshot.activeTab)
      setLlmEndpoint(snapshot.llmEndpoint)
      setLlmModel(snapshot.llmModel)
      setLlmDraft(snapshot.llmDraft)
      setImportText(snapshot.importText)
      setActivity(snapshot.activity)
      setPreferences(snapshot.preferences)
      if (snapshot.importText.trim()) {
        scheduleImportPreview(snapshot.importText)
      } else {
        setImportResult(null)
        setImportState('idle')
      }
      setNotice(successNote)
    },
    [
      scheduleImportPreview,
      setActivity,
      setActiveTab,
      setImportText,
      setListings,
      setLlmEndpoint,
      setLlmModel,
      setPreferences,
      setSubject,
    ],
  )

  useEffect(() => {
    if (didBootstrapImport.current) return
    didBootstrapImport.current = true
    if (!importText.trim()) return
    const timeout = window.setTimeout(() => scheduleImportPreview(importText), 0)
    return () => window.clearTimeout(timeout)
  }, [importText, scheduleImportPreview])

  useEffect(() => {
    const parsed = decodeWorkspaceHash(window.location.hash)
    if (!parsed?.success) return
    const timeout = window.setTimeout(() => {
      applyWorkspaceSnapshot(parsed.data.workspace, 'Shared workspace loaded from URL.')
      addActivity('restore', 'Loaded shared workspace from URL')
      setNotice('Shared workspace loaded from URL.')
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [addActivity, applyWorkspaceSnapshot])

  function applyImportResult(result: ImportResult, summary: string, nextImportText?: string) {
    if (typeof nextImportText === 'string') {
      setImportText(nextImportText)
    }
    setImportResult(result)
    setImportState(result.status)
    setNotice(summary)

    if (result.marketRows.length && !result.listings.length) {
      const firstMarket = result.marketRows[0]
      setSubject((current) => ({
        ...current,
        currentRate: Math.round(firstMarket?.marketAdr || current.currentRate),
        targetOccupancy: firstMarket?.occupancyHint || current.targetOccupancy,
      }))
    }

    if (result.listings.length) {
      setListings(result.listings)
    }

    addActivity('import', summary, result.sourceFingerprint)
  }

  function buildWorkspaceSnapshot(): WorkspaceSnapshot {
    return {
      listings,
      subject,
      activeTab,
      llmEndpoint,
      llmModel,
      llmDraft,
      importText,
      activity,
      preferences,
    }
  }

  async function importWorkspaceOrText(raw: string, label: string) {
    if (looksLikeWorkspaceExport(raw)) {
      const parsed = parseWorkspaceExport(raw)
      if (parsed.success) {
        applyWorkspaceSnapshot(parsed.data.workspace, `${label} restored successfully.`)
        addActivity('restore', `${label} restored successfully.`)
        return
      }
    }

    const result = inferImport(raw)
    applyImportResult(result, `${label}: ${result.summary}`, raw)
  }

  async function handleFileSelection(fileList: FileList | null) {
    if (!fileList?.length) return
    const sources = await readImportFiles(fileList)
    if (sources.length === 1) {
      await importWorkspaceOrText(sources[0]?.text ?? '', sources[0]?.name ?? 'Imported file')
      return
    }

    const result = combineImportSources(sources)
    applyImportResult(result, result.summary, '')
  }

  async function handleClipboardImport() {
    try {
      const text = await readClipboardText()
      await importWorkspaceOrText(text, 'Clipboard import')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Clipboard import failed.')
    }
  }

  async function handleUrlImport() {
    if (!urlInput.trim()) {
      setNotice('Paste a public URL to try a browser fetch, or upload/paste the content directly.')
      return
    }
    try {
      const text = await fetchImportUrl(urlInput.trim())
      await importWorkspaceOrText(text, 'URL import')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'URL import failed.')
    }
  }

  async function handleCopy(label: string, value: string) {
    try {
      await copyText(value)
      setNotice(`${label} copied to clipboard.`)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : `${label} could not be copied.`)
    }
  }

  function handleDownloadMarkdown() {
    addActivity(
      'export',
      `Downloaded markdown report for ${listings.length} listings`,
      importResult?.sourceFingerprint,
    )
    downloadText('hostflow-local-report.md', markdownReport, 'text/markdown;charset=utf-8')
  }

  function handleDownloadWorkspace() {
    addActivity('export', 'Saved workspace JSON', importResult?.sourceFingerprint)
    downloadText(
      'hostflow-local-workspace.json',
      serializeWorkspace(buildWorkspaceSnapshot()),
      'application/json;charset=utf-8',
    )
  }

  function handleDownloadComparablesCsv() {
    addActivity('export', 'Exported comparables CSV', importResult?.sourceFingerprint)
    downloadText(
      'hostflow-local-comparables.csv',
      exportComparablesCsv(listings),
      'text/csv;charset=utf-8',
    )
  }

  function handleDownloadComparablesJson() {
    addActivity('export', 'Exported comparables JSON', importResult?.sourceFingerprint)
    downloadText(
      'hostflow-local-comparables.json',
      exportComparablesJson(listings),
      'application/json;charset=utf-8',
    )
  }

  async function handleShareLink() {
    const shareState = workspaceForShare(buildWorkspaceSnapshot())
    const hash = encodeWorkspaceHash(shareState)
    if (hash.length > 3500) {
      setNotice('This workspace is too large for a share link. Save the workspace JSON instead.')
      return
    }
    const url = `${window.location.origin}${window.location.pathname}${hash}`
    await handleCopy('Share link', url)
  }

  function handlePrintReport() {
    try {
      printTextDocument('HostFlow Local Report', markdownReport)
      addActivity('export', 'Opened printable report view', importResult?.sourceFingerprint)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Print view could not open.')
    }
  }

  function handleResetWorkspace() {
    setListings(sampleListings)
    setSubject(defaultSubjectListing)
    setActiveTab('pricing')
    setLlmDraft('')
    setActivity([createResetActivity()])
    setPreferences(defaultWorkspacePreferences)
    clearImportPreview('Workspace cleared. Sample market is ready.')
  }

  return (
    <main className="min-h-screen bg-[#edf3f1] text-[#202523]">
      <AppHeader />
      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-5 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-4">
          <section
            className={`surface p-4 ${dropActive ? 'ring-2 ring-[#0f6b5f]' : ''}`}
            onDragOver={(event) => {
              event.preventDefault()
              setDropActive(true)
            }}
            onDragLeave={() => setDropActive(false)}
            onDrop={(event) => {
              event.preventDefault()
              setDropActive(false)
              if (event.dataTransfer.files.length) {
                void handleFileSelection(event.dataTransfer.files)
                return
              }
              const droppedText =
                event.dataTransfer.getData('text/html') || event.dataTransfer.getData('text/plain')
              if (droppedText.trim()) {
                void importWorkspaceOrText(droppedText, 'Dropped content')
              }
            }}
          >
            <div className="section-title">
              <Upload size={18} aria-hidden="true" />
              <h2>Market Import</h2>
            </div>
            <input
              ref={fileInputRef}
              className="hidden"
              type="file"
              multiple
              accept=".csv,.txt,.html,.htm,.json,text/csv,text/plain,text/html,application/json"
              onChange={(event) => void handleFileSelection(event.target.files)}
            />
            <textarea
              className="field mt-3 min-h-40"
              value={importText}
              onChange={(event) => scheduleImportPreview(event.target.value)}
              placeholder="CSV or pasted listing HTML"
              aria-label="CSV or pasted listing HTML"
            />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                <FolderUp size={16} aria-hidden="true" />
                Upload
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => void handleClipboardImport()}
              >
                <Clipboard size={16} aria-hidden="true" />
                Clipboard
              </button>
              <button type="button" className="btn btn-primary" onClick={importListings}>
                {importState === 'parsing' ? 'Parsing...' : 'Parse'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  clearImportPreview('Sample market loaded')
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
            <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
              <input
                className="field"
                value={urlInput}
                onChange={(event) => setUrlInput(event.target.value)}
                placeholder="https://example.com/listing-export"
                aria-label="Public URL import"
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => void handleUrlImport()}
              >
                Fetch
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" className="btn btn-secondary" onClick={handleResetWorkspace}>
                <Trash2 size={16} aria-hidden="true" />
                Start fresh
              </button>
              <span className="text-xs text-[#6a6255]">
                Drop files here, paste text, or load a saved workspace JSON.
              </span>
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
                  llmDraft={llmDraft}
                  llmStatus={llmStatus}
                  onGenerate={generateWithLocalLlm}
                  onCopy={(label, value) => void handleCopy(label, value)}
                />
              ) : null}
              {activeTab === 'messages' ? (
                <MessagePanel
                  drafts={drafts}
                  onCopy={(label, value) => void handleCopy(label, value)}
                />
              ) : null}
              {activeTab === 'reviews' ? (
                <ReviewPanel
                  drafts={drafts}
                  onCopy={(label, value) => void handleCopy(label, value)}
                />
              ) : null}
              {activeTab === 'competitors' ? <CompetitorPanel competitors={competitors} /> : null}
              {activeTab === 'export' ? (
                <ExportPanel
                  markdown={markdownReport}
                  onDownloadMarkdown={handleDownloadMarkdown}
                  onCopyMarkdown={() => void handleCopy('Markdown report', markdownReport)}
                  onDownloadWorkspace={handleDownloadWorkspace}
                  onDownloadCsv={handleDownloadComparablesCsv}
                  onDownloadJson={handleDownloadComparablesJson}
                  onShare={() => void handleShareLink()}
                  onPrint={handlePrintReport}
                />
              ) : null}
              {activeTab === 'settings' ? (
                <SettingsPanel
                  llmEndpoint={llmEndpoint}
                  llmModel={llmModel}
                  includeActivityInExports={preferences.includeActivityInExports}
                  debugVisible={preferences.debugVisible}
                  onEndpointChange={setLlmEndpoint}
                  onModelChange={setLlmModel}
                  onIncludeActivityChange={(value) =>
                    setPreferences((current) => ({ ...current, includeActivityInExports: value }))
                  }
                  onDebugVisibleChange={(value) =>
                    setPreferences((current) => ({ ...current, debugVisible: value }))
                  }
                  onReset={handleResetWorkspace}
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
