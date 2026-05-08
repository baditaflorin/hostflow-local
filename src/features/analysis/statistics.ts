export function mean(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
}

export function median(values: number[]) {
  return percentile(values, 0.5)
}

export function percentile(values: number[], point: number) {
  const sorted = values.filter(Number.isFinite).toSorted((a, b) => a - b)
  if (!sorted.length) return 0
  const index = (sorted.length - 1) * point
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  const weight = index - lower
  return (sorted[lower] ?? 0) * (1 - weight) + (sorted[upper] ?? 0) * weight
}

export function standardDeviation(values: number[]) {
  if (values.length < 2) return 0
  const avg = mean(values)
  const variance = mean(values.map((value) => (value - avg) ** 2))
  return Math.sqrt(variance)
}
