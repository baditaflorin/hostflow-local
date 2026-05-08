import { ExternalLink, HeartHandshake, Star } from 'lucide-react'
import { buildInfo } from '../lib/build'

export function AppHeader() {
  return (
    <header className="border-b border-[#d8d1c1] bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0f6b5f]">
            HostFlow Local
          </p>
          <h1 className="text-2xl font-semibold tracking-normal">Airbnb host workflow cockpit</h1>
        </div>
        <nav className="flex flex-wrap gap-2" aria-label="Project links">
          <a className="btn btn-primary" href={buildInfo.repoUrl} target="_blank" rel="noreferrer">
            <Star size={18} aria-hidden="true" />
            Star on GitHub
            <ExternalLink size={14} aria-hidden="true" />
          </a>
          <a
            className="btn btn-secondary"
            href={buildInfo.paypalUrl}
            target="_blank"
            rel="noreferrer"
          >
            <HeartHandshake size={18} aria-hidden="true" />
            PayPal
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </nav>
      </div>
    </header>
  )
}
