# Phase 3 Plan

Created: 2026-05-09

Ranking rule: higher impact on a stranger using the live GitHub Pages app with their own data wins, even if the implementation is less interesting.

## Planned items

1. Add CSV/HTML file upload to the import surface.
2. Add drag-and-drop import for files and pasted text fragments.
3. Add guarded clipboard-read import with fallback guidance.
4. Add batch import for multiple files with partial-success reporting.
5. Add a URL input with honest CORS handling and host-language guidance.
6. Persist import text and import intelligence so reloads feel coherent.
7. Add a real "start fresh" reset that clears persisted workspace state.
8. Add full workspace JSON export with versioned schema and provenance.
9. Add full workspace JSON import with migration-safe validation.
10. Add small-state share URLs via encoded hash state.
11. Add one-click copy for the Markdown report.
12. Add one-click copy for listing copy, guest templates, review responses, and local LLM output.
13. Add comparable-data CSV export.
14. Add comparable-data JSON export.
15. Add print-friendly report output for browser print/PDF.
16. Validate the local LLM endpoint and response shape with actionable errors.
17. Centralize workspace persistence and migration logic in one module.
18. Centralize import reset, import preview, and import-source handling to remove App-level duplication.
19. Remove dead surface and unused dependencies (`cancelled` state, unused packages).
20. Tighten production type boundaries around DuckDB rows, LLM payloads, fixture JSON, and report enrichment.
21. Update README and docs so every public claim matches tested behavior.
22. Run a browser-based stranger test and fix the top three issues found.

## Delivery batches

### Batch A: Input completeness

- 1, 2, 3, 4, 5, 6, 7

### Batch B: Output completeness

- 8, 9, 10, 11, 12, 13, 14, 15

### Batch C: Health and honesty

- 16, 17, 18, 19, 20, 21, 22

## Success checkpoints

1. Input audit turns green except for any consciously deferred rows documented by ADR.
2. Output audit turns green except for any consciously deferred rows documented by ADR.
3. Full workspace round-trip is covered by tests.
4. Stranger test finishes a real workflow on the live UX without any secret instructions.
