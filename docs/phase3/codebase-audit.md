# Phase 3 Codebase Audit

Audit date: 2026-05-09

This audit is measurement-only. No code changes were made as part of the audit itself.

## DRY Violations

1. [src/App.tsx](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-the-airbnb-host/src/App.tsx): import-state clearing, notice updates, and timer cleanup are repeated across the textarea change path and the sample loader.
2. [src/features/export/report.ts](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-the-airbnb-host/src/features/export/report.ts) and [src/components/ImportInsight.tsx](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-the-airbnb-host/src/components/ImportInsight.tsx): import issues and confidence are rendered twice with slightly different formatting rules.

DRY count before Phase 3 work: 2 core duplications.

## SOLID / Boundary Issues

1. [src/App.tsx](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-the-airbnb-host/src/App.tsx) owns import orchestration, persistence, reporting, LLM calls, DuckDB triggers, and top-level UI composition.
2. [src/features/import/inferImport.ts](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-the-airbnb-host/src/features/import/inferImport.ts) is a large mixed-responsibility module covering classification follow-up, CSV parsing, HTML parsing, rating normalization, stable IDs, and summary generation.
3. [src/components/WorkflowPanels.tsx](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-the-airbnb-host/src/components/WorkflowPanels.tsx) holds seven panels in one file, which slows focused changes and testing.

## Dead Code / Dormant Surface

1. `ImportUiState` includes `cancelled`, but the UI does not transition to or render a cancelled state.
2. `@tanstack/react-query` is installed but not used.
3. `clsx` is installed but not used.

Dead-code count before Phase 3 work: 3.

## TODO / FIXME / XXX / HACK

- No actionable occurrences found in source files.

Count before Phase 3 work: 0.

## Type Safety Holes

1. [src/features/duckdb/duckdbSummary.ts](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-the-airbnb-host/src/features/duckdb/duckdbSummary.ts): `row as DuckDbRow`.
2. [src/features/import/inferImport.ts](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-the-airbnb-host/src/features/import/inferImport.ts): `listings as InferredListing[]` and `candidate as InferredListing`.
3. [src/features/drafts/localLlm.ts](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-the-airbnb-host/src/features/drafts/localLlm.ts): `response.json()` cast without schema validation.
4. [src/features/export/report.ts](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-the-airbnb-host/src/features/export/report.ts): listing enrichment uses a structural cast.
5. [src/features/import/realdataFixtures.test.ts](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-the-airbnb-host/src/features/import/realdataFixtures.test.ts): fixture JSON parse uses unchecked casts.

Type-hole count before Phase 3 work: 5.

## Inconsistent Patterns

1. Persistence is partly centralized in [src/lib/storage.ts](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-the-airbnb-host/src/lib/storage.ts), but import text and reset semantics are ad hoc in [src/App.tsx](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-the-airbnb-host/src/App.tsx).
2. Error messaging is split between inline import notices and generic `setNotice(...)` calls from unrelated features.
3. Export actions live only in Markdown today, while the rest of the app behaves as if the whole workspace were a first-class artifact.

## Test Coverage Gaps

1. No UI tests for import via browser events, because file upload and drag/drop do not exist yet.
2. No round-trip tests for saving and restoring a full workspace.
3. No tests for copy-to-clipboard flows.
4. No tests for LLM endpoint validation or user-facing error guidance.
