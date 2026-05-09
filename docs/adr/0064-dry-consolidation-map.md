# 0064. DRY Consolidation Map

- Status: accepted
- Date: 2026-05-09

## Context

Phase 3 audits found duplicated import reset logic and duplicate import-intelligence formatting. Persistence logic also risks scattering as more pathways are added.

## Decision

- Introduce a canonical workspace-state module for save/load/reset/share/export.
- Introduce a canonical import-source module for text, files, clipboard, and URLs.
- Introduce shared export helpers for clipboard/download serialization.

## Consequences

- `App.tsx` should shrink and become orchestration-only.
- New pathways reuse the same validation and provenance logic.

## Alternatives considered

- Leave small duplications alone: rejected because Phase 3 adds more pathways that would multiply them.
