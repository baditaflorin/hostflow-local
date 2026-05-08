import type { LucideIcon } from 'lucide-react'

export type TabItem<T extends string> = {
  id: T
  label: string
  icon: LucideIcon
}

export function TabBar<T extends string>({
  items,
  active,
  onChange,
}: {
  items: TabItem<T>[]
  active: T
  onChange: (tab: T) => void
}) {
  return (
    <div className="tabbar" role="tablist" aria-label="Workflow sections">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active === item.id}
            className="tab-button"
            data-active={active === item.id}
            onClick={() => onChange(item.id)}
          >
            <Icon size={17} aria-hidden="true" />
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
