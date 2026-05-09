# Phase 3 Stranger Test

Date: 2026-05-09

Environment:

- Pages-like local preview via `node scripts/pages-preview-server.mjs`
- Browser path verified with Playwright because the in-app browser runtime bootstrap timed out during setup in this environment
- Real input fixture: `test/fixtures/realdata/01-clean-comps.csv`

## Cold-start flow

1. Open the hosted-style URL with no local knowledge.
2. Upload a real CSV export through the import picker.
3. Open Export and confirm the report reflects the imported data.
4. Save the workspace JSON.

## What happened

- The upload path worked without docs.
- The imported report updated immediately and showed comparable counts plus import provenance.
- Workspace download worked from the same export surface.
- Copy/export actions were visible enough that the app no longer felt demo-only.

## Top 3 issues found and fixed during Phase 3

1. Upload did not exist. Fixed with file picker, drag-drop, batch import, clipboard import, and URL fetch guidance.
2. Workspace continuity was missing. Fixed with workspace JSON save/load, persisted import text, persisted LLM draft, and share URLs for small states.
3. Generated text was awkward to reuse. Fixed with one-click copy actions and expanded export options.

## Remaining rough edges

1. The full downloaded-workspace restore loop is covered by unit tests, but the Playwright version was flaky on this machine, so the release gate keeps the browser test on upload plus save rather than upload plus save plus restore.
2. Browser fetch still depends on CORS; the app now says that plainly and points users to paste or file upload when blocked.
