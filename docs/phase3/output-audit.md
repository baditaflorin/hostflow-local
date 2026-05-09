# Phase 3 Output Audit

Audit date: 2026-05-09

Status key:

- `green`: works fully on real user output
- `yellow`: works partially or only with manual effort
- `red`: expected but not built

| Output pathway                        | Status | Current behavior                                                                                 | Gap to close                                                                 |
| ------------------------------------- | ------ | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| Markdown download                     | green  | Export tab downloads a Pandoc-ready Markdown report with version, commit, and import provenance. | Add state provenance and a smoother next-step path.                          |
| Read-only on-screen report            | green  | Full report is visible in-app before download.                                                   | Add copy and print affordances.                                              |
| Copy export to clipboard              | red    | No copy button exists for the report or any generated template.                                  | Add one-click clipboard copy with confirmation.                              |
| Save full workspace state             | red    | Not built.                                                                                       | Add downloadable state file with schema version and import metadata.         |
| Load saved workspace state            | red    | Not built.                                                                                       | Pair with state export to create round-trip continuity.                      |
| Shareable link                        | red    | Not built.                                                                                       | Add hash-based share URL for small workspaces.                               |
| JSON export                           | red    | Not built.                                                                                       | Add structured export for automation and re-import.                          |
| CSV export                            | red    | Not built.                                                                                       | Add comparable-data CSV export for downstream spreadsheet use.               |
| Print/PDF-friendly output             | yellow | User can download Markdown and convert with Pandoc manually outside the app.                     | Add print view and browser-print path.                                       |
| Copy guest templates individually     | red    | Not built.                                                                                       | Add copy actions per text block.                                             |
| Copy review responses individually    | red    | Not built.                                                                                       | Add copy actions per text block.                                             |
| Copy listing copy blocks individually | red    | Not built.                                                                                       | Add copy actions per text block.                                             |
| API/curl-ready output                 | red    | Not built.                                                                                       | Add JSON export and documented schema instead of pretending there is an API. |

Summary:

- Green: 2
- Yellow: 1
- Red: 10

Highest-impact gaps:

1. The app can produce work, but it cannot package the full workspace for later reuse.
2. Common copy-to-clipboard actions are missing, forcing manual selection.
3. Structured exports are absent, so the tool is weak in real workflows after the first report.
