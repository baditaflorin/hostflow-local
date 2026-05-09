export type ActivityEvent = {
  id: string
  at: string
  type: 'import' | 'export' | 'sample' | 'restore' | 'reset'
  summary: string
  sourceFingerprint?: string
}
