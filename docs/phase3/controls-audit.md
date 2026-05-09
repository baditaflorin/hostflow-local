# Phase 3 Controls Audit

Audit date: 2026-05-09

| Control                  | Status | Notes                                                                                |
| ------------------------ | ------ | ------------------------------------------------------------------------------------ |
| Import textarea          | green  | Works for paste flows and now sits beside upload, clipboard, URL, and reset actions. |
| Upload button            | green  | Opens the file picker for host data and workspace JSON.                              |
| Clipboard button         | green  | Reads clipboard text with actionable fallback messaging.                             |
| URL fetch button         | green  | Attempts a browser fetch and explains CORS limits honestly.                          |
| Parse button             | green  | Uses Phase 2 inference and commits the current preview.                              |
| Sample button            | green  | Loads useful data and records activity.                                              |
| Start fresh button       | green  | Clears the local workspace intentionally.                                            |
| Subject listing fields   | green  | All numeric/text controls affect downstream analysis immediately and persist.        |
| Tab bar                  | green  | Switches between all current work areas and persists selected tab.                   |
| DuckDB "Run SQL Summary" | green  | Runs on demand and reports failure inline.                                           |
| Local LLM endpoint input | green  | Persists and is used by the "Polish Copy" action.                                    |
| Local LLM model input    | green  | Persists and is used by the "Polish Copy" action.                                    |
| "Polish Copy" button     | green  | Works with URL validation and copyable output.                                       |
| Export markdown textarea | green  | Visible alongside copy, print, save, JSON, CSV, and share actions.                   |
| "Download .md" button    | green  | Produces a real file and records export activity.                                    |
| Header GitHub link       | green  | Points to the public repository.                                                     |
| Header PayPal link       | green  | Points to the user-provided PayPal URL.                                              |

Control findings:

1. No visible control is a stub.
2. The remaining tradeoff is honest size-based fallback from share URLs to workspace JSON.
