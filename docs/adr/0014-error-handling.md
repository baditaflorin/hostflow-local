# 0014 - Error handling conventions

## Status

Accepted

## Context

Imported HTML, optional WASM, and optional local LLM calls can fail in predictable ways.

## Decision

Use explicit result objects or thrown `Error` instances at module boundaries, caught in React event handlers. Show actionable inline messages. Do not fail the whole app when optional enhancements fail.

## Consequences

- Import failures can point to missing fields.
- DuckDB and local LLM errors stay scoped to their panels.
- Production console noise stays low.

## Alternatives Considered

- Global try/catch around all UI: rejected because domain failures need local recovery.
