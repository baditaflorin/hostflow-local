import { z } from 'zod'
import { activityEventSchema, type ActivityEvent } from './activity'
import { buildInfo } from './build'
import {
  subjectListingSchema,
  listingSchema,
  type Listing,
  type SubjectListing,
} from '../features/import/listingSchema'

export const workspaceSchemaVersion = 'hostflow.workspace.v1'

export const workspaceTabSchema = z.enum([
  'pricing',
  'calendar',
  'copy',
  'messages',
  'reviews',
  'competitors',
  'export',
  'settings',
])

export type WorkspaceTab = z.infer<typeof workspaceTabSchema>

export const workspacePreferencesSchema = z.object({
  includeActivityInExports: z.boolean().default(true),
  debugVisible: z.boolean().default(false),
})

export type WorkspacePreferences = z.infer<typeof workspacePreferencesSchema>

export const workspaceSnapshotSchema = z.object({
  listings: z.array(listingSchema),
  subject: subjectListingSchema,
  activeTab: workspaceTabSchema,
  llmEndpoint: z.string(),
  llmModel: z.string(),
  llmDraft: z.string(),
  importText: z.string(),
  activity: z.array(activityEventSchema),
  preferences: workspacePreferencesSchema,
})

export type WorkspaceSnapshot = z.infer<typeof workspaceSnapshotSchema>

export const workspaceExportSchema = z.object({
  schemaVersion: z.literal(workspaceSchemaVersion),
  appVersion: z.string(),
  commit: z.string(),
  exportedAt: z.string(),
  workspace: workspaceSnapshotSchema,
})

export type WorkspaceExport = z.infer<typeof workspaceExportSchema>

export const defaultWorkspacePreferences: WorkspacePreferences = {
  includeActivityInExports: true,
  debugVisible: false,
}

export function createWorkspaceExport(workspace: WorkspaceSnapshot): WorkspaceExport {
  return {
    schemaVersion: workspaceSchemaVersion,
    appVersion: buildInfo.version,
    commit: buildInfo.commit,
    exportedAt: new Date().toISOString(),
    workspace,
  }
}

export function serializeWorkspace(workspace: WorkspaceSnapshot) {
  return JSON.stringify(createWorkspaceExport(workspace), null, 2)
}

export function parseWorkspaceExport(input: string) {
  try {
    const parsedJson = JSON.parse(input)
    return workspaceExportSchema.safeParse(parsedJson)
  } catch {
    return workspaceExportSchema.safeParse(null)
  }
}

export function looksLikeWorkspaceExport(input: string) {
  return input.includes(`"${workspaceSchemaVersion}"`) || input.includes(workspaceSchemaVersion)
}

export function encodeWorkspaceHash(workspace: WorkspaceSnapshot) {
  const exportPayload = createWorkspaceExport(workspace)
  const json = JSON.stringify(exportPayload)
  const bytes = new TextEncoder().encode(json)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  const encoded = btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
  return `#workspace=${encoded}`
}

export function decodeWorkspaceHash(hash: string) {
  const match = hash.match(/workspace=([^&]+)/)
  if (!match?.[1]) return null

  try {
    const normalized = match[1].replaceAll('-', '+').replaceAll('_', '/')
    const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4))
    const binary = atob(`${normalized}${padding}`)
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
    const json = new TextDecoder().decode(bytes)
    return parseWorkspaceExport(json)
  } catch {
    return workspaceExportSchema.safeParse(null)
  }
}

export function workspaceForShare(workspace: WorkspaceSnapshot) {
  return {
    ...workspace,
    activity: workspace.activity.slice(0, 4),
    llmDraft: workspace.llmDraft.slice(0, 1200),
    importText: workspace.importText.slice(0, 4000),
  }
}

export function mergeWorkspaceImport(current: WorkspaceSnapshot, next: Partial<WorkspaceSnapshot>) {
  return workspaceSnapshotSchema.parse({
    listings: next.listings ?? current.listings,
    subject: next.subject ?? current.subject,
    activeTab: next.activeTab ?? current.activeTab,
    llmEndpoint: next.llmEndpoint ?? current.llmEndpoint,
    llmModel: next.llmModel ?? current.llmModel,
    llmDraft: next.llmDraft ?? current.llmDraft,
    importText: next.importText ?? current.importText,
    activity: next.activity ?? current.activity,
    preferences: next.preferences ?? current.preferences,
  })
}

export function createResetActivity(): ActivityEvent {
  return {
    id: `${Date.now()}-reset`,
    at: new Date().toISOString(),
    type: 'reset',
    summary: 'Cleared the local workspace',
  }
}

export function isListingArray(value: unknown): value is Listing[] {
  return z.array(listingSchema).safeParse(value).success
}

export function isSubjectListing(value: unknown): value is SubjectListing {
  return subjectListingSchema.safeParse(value).success
}
