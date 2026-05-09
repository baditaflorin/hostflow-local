# Phase 3 Findings

Audit date: 2026-05-09

## Top 5 usability gaps

1. A normal host cannot import a `.csv` file directly, only paste its contents.
2. The app can generate a report, but it cannot save or restore the whole workspace.
3. Generated text is visible but not easy to copy where hosts actually need it.
4. The LLM path works only if the user already understands the endpoint shape and failure modes.
5. Reload persistence exists, but there is no trustworthy "start fresh" path or schema migration story.

## Top 5 half-baked features

1. Import is real, but only for paste. Decision needed: finish with file/drag/drop/clipboard or narrow the product promise.
2. Export is real, but only as Markdown. Decision needed: finish workspace/state export and structured exports.
3. Local LLM support is real, but under-guided. Decision needed: finish with validation and better errors.
4. Persistence is real, but incomplete. Decision needed: finish with full workspace save/restore/reset.
5. Shareability is absent. Decision needed: finish with a small-state share URL or call it intentionally out of scope.

## Top 5 codebase pain points

1. `App.tsx` is the orchestration hub for too many concerns.
2. Import inference is powerful now but packed into one oversized module.
3. Export and import-insight rendering duplicate some host-language logic.
4. Boundary validation is uneven, especially around LLM responses and structured exports.
5. Tests are strong on import inference but weak on end-to-end workspace flows.

## Top 5 documentation/reality mismatches

1. "CSV import" sounds like file import; the app only supports pasted CSV text.
2. Export language implies a complete workflow handoff, but workspace save/restore is missing.
3. The README quickstart is honest for developers but not for end users trying to use the hosted app.
4. The docs mention local-first persistence without a reset or migration story.
5. The README’s feature list does not surface the LLM endpoint assumptions clearly enough.

## Project-specific definition of "fully usable"

1. A host can paste, upload, or drop their own CSV/HTML data and get a useful result without reading docs first.
2. The host can leave and return later without losing work, or deliberately export/import the whole workspace.
3. Every generated artifact the host is likely to reuse can be copied or downloaded in one click.
4. When the app cannot do something, it says what happened, why, and the next best step in host language.
5. The hosted GitHub Pages app is enough for end-to-end solo use without asking the developer for help.

## Phase 3 success metrics

1. Input audit: all rows green except explicitly out-of-scope items documented by ADR.
2. Output audit: all rows green except explicitly out-of-scope items documented by ADR.
3. Full workspace export and import round-trip passes deterministically.
4. At least one browser-based stranger test passes with real fixture input and no developer intervention.
5. Codebase metrics improve to zero core DRY violations, zero dead-code findings, and zero unvalidated boundary casts in production code.

## Out of scope

1. No new product domains beyond host import, pricing, calendar, copy, messages, reviews, competitors, DuckDB, LLM, and export.
2. No visual-polish pass, theming work, or animation work marketed as Phase 3.
3. No architecture escalation beyond Mode A GitHub Pages.
