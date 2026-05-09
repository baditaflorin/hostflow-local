import { z } from 'zod'

export const activityEventSchema = z.object({
  id: z.string(),
  at: z.string(),
  type: z.enum(['import', 'export', 'sample', 'restore', 'reset']),
  summary: z.string(),
  sourceFingerprint: z.string().optional(),
})

export type ActivityEvent = {
  id: string
  at: string
  type: 'import' | 'export' | 'sample' | 'restore' | 'reset'
  summary: string
  sourceFingerprint?: string
}
