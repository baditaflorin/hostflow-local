import { ExternalLink, HeartHandshake, Star } from 'lucide-react'

declare const __APP_VERSION__: string
declare const __APP_COMMIT__: string
declare const __REPO_URL__: string
declare const __PAYPAL_URL__: string

function App() {
  return (
    <main className="min-h-screen bg-[#f7f5ee] text-[#211f1b]">
      <header className="border-b border-[#d8d1c1] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0f6b5f]">
              HostFlow Local
            </p>
            <h1 className="text-2xl font-semibold tracking-normal">
              Static short-term rental host cockpit
            </h1>
          </div>
          <nav className="flex flex-wrap gap-2" aria-label="Project links">
            <a className="btn btn-primary" href={__REPO_URL__} target="_blank" rel="noreferrer">
              <Star size={18} aria-hidden="true" />
              Star on GitHub
              <ExternalLink size={14} aria-hidden="true" />
            </a>
            <a className="btn btn-secondary" href={__PAYPAL_URL__} target="_blank" rel="noreferrer">
              <HeartHandshake size={18} aria-hidden="true" />
              PayPal
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="surface p-6">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h2 className="text-xl font-semibold">Pricing analysis to guest-ready copy</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5d574c]">
                Paste listing HTML, CSV, or sample data; get local market position, calendar
                recommendations, competitor notes, and reusable host communication drafts.
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4 lg:grid-cols-2">
              <div className="metric">
                <dt>Mode</dt>
                <dd>GitHub Pages</dd>
              </div>
              <div className="metric">
                <dt>Backend</dt>
                <dd>None</dd>
              </div>
              <div className="metric">
                <dt>Version</dt>
                <dd>{__APP_VERSION__}</dd>
              </div>
              <div className="metric">
                <dt>Commit</dt>
                <dd>{__APP_COMMIT__}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
