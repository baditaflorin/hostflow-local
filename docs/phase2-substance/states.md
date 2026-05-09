# Phase 2 State Taxonomy

## Import States

- `idle`: no import operation is running. Exit: paste data or load sample.
- `parsing`: normalized input is being classified and parsed. Exit: finish or cancel.
- `loaded-empty`: parsed cleanly but produced no usable records. Exit: paste different data or use sample.
- `loaded-some`: parsed one to nine usable records. Exit: continue, inspect debug, export.
- `loaded-many`: parsed ten or more usable records. Exit: continue, inspect debug, export.
- `loaded-partial`: parsed some records and kept warnings for skipped rows. Exit: continue with warnings or paste corrected data.
- `recoverable-error`: input is retained and next step is shown. Exit: paste corrected data or use sample.
- `fatal-error`: parsing could not safely proceed. Exit: clear input or use sample.
- `cancelled`: operation stopped before replacing prior results. Exit: retry or keep prior results.

## Async Operation States

- `duckdb-idle`
- `duckdb-running`
- `duckdb-ready`
- `duckdb-recoverable-error`
- `llm-idle`
- `llm-running`
- `llm-ready`
- `llm-recoverable-error`

Repeated clicks while running are ignored and preserve the existing state.
