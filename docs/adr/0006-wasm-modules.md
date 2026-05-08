# 0006 - WASM modules

## Status

Accepted

## Context

DuckDB-WASM can provide in-browser analytical SQL for imported listings. WASM payloads must not inflate first load.

## Decision

Use `@duckdb/duckdb-wasm` only behind a user action. The main app computes first-pass recommendations in TypeScript. When the user runs the DuckDB summary, the module is imported dynamically and initialized in the browser.

GitHub Pages cannot set COOP/COEP headers. v1 uses the DuckDB-WASM browser bundle path that works without requiring shared array buffers. If future features require stricter headers, we will revisit the deployment mode.

## Consequences

- Initial bundle stays below the target.
- DuckDB failures do not block the main workflow.
- WASM is a progressive enhancement, not a hard dependency.

## Alternatives Considered

- Load DuckDB at startup: rejected for payload and startup cost.
- Avoid WASM entirely: rejected because SQL summaries are valuable for imported competitor sets.
