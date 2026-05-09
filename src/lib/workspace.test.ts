import { describe, expect, it } from 'vitest'
import { defaultSubjectListing } from '../features/import/listingSchema'
import { sampleListings } from '../features/import/sampleListings'
import {
  decodeWorkspaceHash,
  defaultWorkspacePreferences,
  encodeWorkspaceHash,
  parseWorkspaceExport,
  serializeWorkspace,
  workspaceSnapshotSchema,
} from './workspace'

const workspace = workspaceSnapshotSchema.parse({
  listings: sampleListings,
  subject: defaultSubjectListing,
  activeTab: 'export',
  llmEndpoint: 'http://localhost:11434/api/generate',
  llmModel: 'llama3.2',
  llmDraft: 'Polished local draft',
  importText: 'title,price\nSample,123',
  activity: [],
  preferences: defaultWorkspacePreferences,
})

describe('workspace helpers', () => {
  it('round-trips workspace JSON exports', () => {
    const parsed = parseWorkspaceExport(serializeWorkspace(workspace))

    expect(parsed.success).toBe(true)
    expect(parsed.success && parsed.data.workspace.activeTab).toBe('export')
    expect(parsed.success && parsed.data.workspace.listings).toHaveLength(sampleListings.length)
  })

  it('round-trips workspace share hashes', () => {
    const parsed = decodeWorkspaceHash(encodeWorkspaceHash(workspace))

    expect(parsed?.success).toBe(true)
    expect(parsed?.success && parsed.data.workspace.importText).toContain('title,price')
  })
})
