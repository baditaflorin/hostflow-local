# Phase 3 Controls Audit

Audit date: 2026-05-09

| Control                  | Status | Notes                                                                                                                    |
| ------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------ |
| Import textarea          | yellow | Works for paste flows, but the empty state still assumes the user knows to paste rather than upload.                     |
| Parse button             | green  | Uses Phase 2 inference and no longer silently returns wrong-card confidence on the audited fixtures.                     |
| Sample button            | green  | Loads useful data and records activity.                                                                                  |
| Subject listing fields   | green  | All numeric/text controls affect downstream analysis immediately and persist.                                            |
| Tab bar                  | green  | Switches between all current work areas and persists selected tab.                                                       |
| DuckDB "Run SQL Summary" | yellow | Works, but its error message is generic and the action is unavailable if the user expects exportable results from it.    |
| Local LLM endpoint input | green  | Persists and is used by the "Polish Copy" action.                                                                        |
| Local LLM model input    | green  | Persists and is used by the "Polish Copy" action.                                                                        |
| "Polish Copy" button     | yellow | Works when the endpoint is valid, but there is no validation helper, cancellation, or direct copy action for the result. |
| Export markdown textarea | yellow | Visible and readable, but there is no copy button, print path, or state export adjacent to it.                           |
| "Download .md" button    | green  | Produces a real file and now records export activity.                                                                    |
| Header GitHub link       | green  | Points to the public repository.                                                                                         |
| Header PayPal link       | green  | Points to the user-provided PayPal URL.                                                                                  |

Control findings:

1. No visible control is a total stub, which is good.
2. Several controls are still only one half of a workflow: generate without copy, summarize without export, persist some state without reset or migration.
