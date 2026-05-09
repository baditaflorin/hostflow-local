# Phase 3 Feature Claims Audit

Audit date: 2026-05-09

README and docs claims checked against the shipping app:

| Claim                                                                                        | Status | Evidence                                                                    | Action                                                 |
| -------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------- | ------------------------------------------------------ |
| "Local-first toolkit for short-term rental hosts"                                            | green  | All core analysis and draft generation run in-browser.                      | Keep.                                                  |
| "Paste-HTML and CSV listing import"                                                          | yellow | Paste works; direct CSV file import does not.                               | Either add file import or tighten wording. Prefer add. |
| "Pricing band, occupancy signal, and 30-day calendar recommendations"                        | green  | Visible in app and tested.                                                  | Keep.                                                  |
| "Listing copy, guest templates, review responses, competitor ranking"                        | green  | Visible in app and deterministic.                                           | Keep.                                                  |
| "Pandoc-ready Markdown export"                                                               | green  | Download path works and report is well-formed.                              | Keep.                                                  |
| "Lazy DuckDB-WASM neighborhood summary"                                                      | green  | Action exists and executes in-browser.                                      | Keep.                                                  |
| "Optional local LLM polish through a user-owned endpoint"                                    | yellow | Works, but the workflow is brittle when the endpoint is missing or invalid. | Improve validation and guidance.                       |
| "Version and commit metadata visible in the live GitHub Pages UI"                            | green  | Build tile shows both.                                                      | Keep.                                                  |
| `docs/data.md`: "The app accepts user-supplied pasted HTML, CSV, or bundled sample records." | yellow | User-supplied CSV is true only through paste, not upload.                   | Clarify or implement upload.                           |
| `docs/architecture.md`: "Browser storage uses localStorage today; IndexedDB/OPFS later"      | green  | Current storage matches docs.                                               | Keep.                                                  |

Top mismatches:

1. "Import" reads broader than the actual paste-only behavior.
2. LLM support is real but under-guided.
3. Export language overstates workflow completion because reusable state export is missing.
