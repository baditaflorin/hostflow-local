# Phase 3 Input Audit

Audit date: 2026-05-09

Status key:

- `green`: works fully on real user input
- `yellow`: works partially or with meaningful limits
- `red`: claimed by surface area or expected by users, but not built

| Input pathway                            | Status | Current behavior                                                                                                               | Gap to close                                                                                                              |
| ---------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Paste plain text into import box         | green  | One textarea accepts pasted CSV and pasted listing text. Phase 2 inference now classifies messy host inputs and previews them. | Keep deterministic and fast on large pastes.                                                                              |
| Paste raw HTML into import box           | green  | Rendered OTA card HTML can be pasted directly and previewed. Challenge pages are explained instead of silently failing.        | Add an easier correction path when the wrong layer is pasted.                                                             |
| CSV import from spreadsheet/browser copy | yellow | Works when the user manually pastes CSV-like text into the textarea.                                                           | No direct file picker, no multi-file flow, no import-state file.                                                          |
| File upload                              | red    | No file input exists. A stranger with a `.csv` export has to know they must open it and paste the contents.                    | Add file picker with format detection and validation.                                                                     |
| Drag and drop                            | red    | No drop zone exists. Dropping a file or HTML fragment on the page does nothing useful.                                         | Add drag/drop for files and text.                                                                                         |
| Clipboard read button                    | red    | The app can accept pasted text, but there is no one-click clipboard read flow or permissions handling.                         | Add a guarded clipboard-read action with fallback help.                                                                   |
| Mobile file picker                       | red    | No `<input type="file">` means phone/tablet users cannot choose exports from Files or share-sheet cleanly.                     | Reuse file-upload path on mobile.                                                                                         |
| Multi-file import                        | red    | Not built.                                                                                                                     | Add batch import with per-file status and partial success.                                                                |
| Folder import                            | red    | Not built.                                                                                                                     | Explicitly out of scope for v0.3.0 unless a simple browser-safe path appears.                                             |
| URL input                                | red    | Not built.                                                                                                                     | Add a small URL field with honest CORS guidance and no fake promise of scraping blocked pages.                            |
| Sample/demo market                       | green  | Sample button loads a useful starter dataset immediately.                                                                      | Keep parity with real-data paths.                                                                                         |
| Restore last session                     | yellow | Listings, subject, tab, LLM endpoint/model, and activity restore from `localStorage`.                                          | Import text, notices, and exportable project state do not restore coherently; there is no migration policy or reset flow. |
| Import project/state file                | red    | Not built.                                                                                                                     | Add a versioned state file import path.                                                                                   |
| Deep-link import from URL hash/query     | red    | Not built.                                                                                                                     | Add a shareable URL for small state payloads.                                                                             |
| Start fresh / clear workspace            | red    | Not built.                                                                                                                     | Add a real reset action that clears persisted state and import buffers.                                                   |

Summary:

- Green: 3
- Yellow: 2
- Red: 10

Highest-impact gaps:

1. Users cannot import from a file at all, which is the most normal host workflow.
2. Session restore is incomplete, so the app feels unreliable after reload.
3. There is no honest recovery path from pasted-vs-file-vs-URL confusion.
