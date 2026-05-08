# 0002 - Architecture overview and module boundaries

## Status

Accepted

## Context

The app needs a clear feature structure while staying small enough to ship as a static site.

## Decision

Use a browser-only architecture with these source boundaries:

- `src/features/import`: HTML/CSV/sample data ingestion and validation.
- `src/features/analysis`: pricing, calendar, competitor, and revenue calculations.
- `src/features/drafts`: deterministic copy, message, and review draft generation.
- `src/features/duckdb`: lazy DuckDB-WASM adapter.
- `src/features/export`: Markdown and HTML export helpers.
- `src/components`: reusable interface pieces.
- `src/lib`: storage, formatting, build metadata, and shared helpers.

## Consequences

- The frontend is the main product.
- Domain logic can be unit-tested without rendering React.
- Runtime-only code stays isolated behind user actions.

## Alternatives Considered

- A single `App.tsx` implementation: rejected because the workflow has several independently testable domains.
- A backend-oriented package layout: rejected because Mode A has no backend.
