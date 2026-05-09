# Phase 3 Input Audit

Audit date: 2026-05-09

Status key:

- `green`: works fully on real user input
- `deferred`: intentionally out of scope and documented by ADR

| Input pathway                            | Status   | Current behavior                                                                                          | Gap to close                                                       |
| ---------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Paste plain text into import box         | green    | Textarea accepts pasted CSV and listing text with live preview.                                           | None in Phase 3 scope.                                             |
| Paste raw HTML into import box           | green    | Rendered OTA card HTML can be pasted directly and previewed.                                              | None in Phase 3 scope.                                             |
| CSV import from spreadsheet/browser copy | green    | Paste works and keeps import intelligence visible before acting.                                          | None in Phase 3 scope.                                             |
| File upload                              | green    | Upload accepts CSV, HTML, text, and workspace JSON.                                                       | None in Phase 3 scope.                                             |
| Drag and drop                            | green    | Drop zone accepts files and dropped text/HTML.                                                            | None in Phase 3 scope.                                             |
| Clipboard read button                    | green    | One-click clipboard import reads text with actionable fallback messaging.                                 | None in Phase 3 scope.                                             |
| Mobile file picker                       | green    | The upload control uses the browser file picker and works for mobile-friendly file sources.               | None in Phase 3 scope.                                             |
| Multi-file import                        | green    | Multiple files are read and combined into one import result.                                              | Per-file UI detail can still deepen later.                         |
| Folder import                            | deferred | Not built. ADR 0061 keeps it out of scope for v0.2.0.                                                     | Revisit only if hosts start importing whole folders routinely.     |
| URL input                                | green    | Browser fetch works when allowed and gives CORS-aware next steps when blocked.                            | None in Phase 3 scope.                                             |
| Sample/demo market                       | green    | Sample button remains first-class.                                                                        | None in Phase 3 scope.                                             |
| Restore last session                     | green    | Listings, subject, tab, import text, LLM endpoint/model/draft, activity, and preferences restore locally. | None in Phase 3 scope.                                             |
| Import project/state file                | green    | Workspace JSON files restore the full saved state.                                                        | None in Phase 3 scope.                                             |
| Deep-link import from URL hash/query     | green    | Small-state share URLs restore a workspace from `#workspace=...`.                                         | Very large workspaces still point users to JSON save/load instead. |
| Start fresh / clear workspace            | green    | Reset clears the local workspace intentionally.                                                           | None in Phase 3 scope.                                             |

Summary:

- Green: 14
- Deferred: 1

Highest-impact remaining limitation:

1. Folder import is still intentionally out of scope.
