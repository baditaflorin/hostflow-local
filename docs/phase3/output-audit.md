# Phase 3 Output Audit

Audit date: 2026-05-09

Status key:

- `green`: works fully on real user output

| Output pathway                        | Status | Current behavior                                                                                 | Gap to close                                     |
| ------------------------------------- | ------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| Markdown download                     | green  | Export tab downloads a Pandoc-ready Markdown report with version, commit, and import provenance. | None in Phase 3 scope.                           |
| Read-only on-screen report            | green  | Full report is visible in-app before download.                                                   | None in Phase 3 scope.                           |
| Copy export to clipboard              | green  | Markdown report can be copied in one click.                                                      | None in Phase 3 scope.                           |
| Save full workspace state             | green  | Workspace JSON export includes versioned schema and provenance.                                  | None in Phase 3 scope.                           |
| Load saved workspace state            | green  | Workspace JSON is accepted through the same upload path.                                         | None in Phase 3 scope.                           |
| Shareable link                        | green  | Small workspaces can be copied as URL hash links.                                                | Very large states still use JSON export instead. |
| JSON export                           | green  | Comparable listings export as JSON for automation-friendly use.                                  | None in Phase 3 scope.                           |
| CSV export                            | green  | Comparable listings export as CSV for spreadsheet workflows.                                     | None in Phase 3 scope.                           |
| Print/PDF-friendly output             | green  | Print action opens a browser-printable report view.                                              | None in Phase 3 scope.                           |
| Copy guest templates individually     | green  | Each template block has a copy action.                                                           | None in Phase 3 scope.                           |
| Copy review responses individually    | green  | Each review response block has a copy action.                                                    | None in Phase 3 scope.                           |
| Copy listing copy blocks individually | green  | Title options, summary, bullets, and LLM output all have copy actions.                           | None in Phase 3 scope.                           |
| API/automation-ready output           | green  | JSON export fills the automation-ready role honestly without pretending there is a runtime API.  | None in Phase 3 scope.                           |

Summary:

- Green: 13

Highest-impact remaining limitation:

1. Share links have a practical size ceiling, so workspace JSON remains the fallback for larger states.
