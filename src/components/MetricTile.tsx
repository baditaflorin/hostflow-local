import type { ReactNode } from 'react'

export function MetricTile({
  label,
  value,
  detail,
}: {
  label: string
  value: ReactNode
  detail?: ReactNode
}) {
  return (
    <div className="metric">
      <dt>{label}</dt>
      <dd>{value}</dd>
      {detail ? <p className="mt-2 text-xs leading-5 text-[#6a6255]">{detail}</p> : null}
    </div>
  )
}
