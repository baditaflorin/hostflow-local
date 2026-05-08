# Postmortem

Date: 2026-05-08

Release: v0.1.0

Live site: https://baditaflorin.github.io/hostflow-local/

Repository: https://github.com/baditaflorin/hostflow-local

## What was built

HostFlow Local v0.1.0 is a Mode A GitHub Pages app for short-term rental hosts. It imports pasted listing HTML or CSV, normalizes listings into `hostflow.listings.v1`, analyzes pricing, recommends a 30-day calendar, ranks competitors, drafts listing copy, generates guest message templates, drafts review responses, and exports a Pandoc-ready Markdown report.

The live page includes the repository link, PayPal link, app version, and git commit.

## Was Mode A correct?

Yes. Mode A was the right choice for v1. The workflow does not need runtime secrets, hosted auth, cross-device sync, or server-side writes. DuckDB-WASM works as a lazy enhancement, and optional local LLM calls can remain user-owned browser requests.

Mode B may become useful only if future versions ship public geodata artifacts or benchmark datasets. Mode C is still not justified.

## What worked

- GitHub Pages from `gh-pages` avoided conflicts with `docs/adr`.
- React/Vite kept the app small enough for the asset budget.
- Domain modules made pricing, parsing, drafts, and exports easy to test.
- The local preview server caught the project-path behavior that plain `dist/` serving would miss.

## What did not work

- The first local smoke setup served `dist/` at root and did not mimic `https://baditaflorin.github.io/hostflow-local/`.
- The first palette pass was too beige-heavy and needed revision.
- Vitest initially picked up Playwright specs until a dedicated Vitest config limited unit test discovery.

## What surprised us

GitHub Pages was enabled immediately once the `gh-pages` branch existed, and the public URL served the updated artifact quickly after the branch push.

## Accepted tech debt

- Parser heuristics are broad but not platform-specific enough for every pasted marketplace layout.
- Browser storage uses localStorage; IndexedDB or OPFS should replace it if imports become large.
- Geo analysis uses coordinates and local distance heuristics, not full libosmscout or GeoNames artifacts yet.
- The deterministic draft generator is useful without a model, but local LLM quality depends on the user's endpoint.

## Next improvements

1. Add import presets for common Airbnb, Booking, and PriceLabs CSV shapes.
2. Add IndexedDB/OPFS storage plus workspace import/export.
3. Add optional Mode B geodata artifacts for neighborhood enrichment and walkable competitor radius analysis.

## Time spent vs estimate

Estimated: 4-6 hours for a complete static v0.1.0 with docs, hooks, tests, and Pages publishing.

Actual: about 3 hours in one implementation pass, with the main extra time spent on Pages-path smoke testing and visual polish.
