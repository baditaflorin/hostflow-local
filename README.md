# HostFlow Local

[![Live on GitHub Pages](https://img.shields.io/badge/live-GitHub%20Pages-0969da)](https://baditaflorin.github.io/hostflow-local/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Local-first toolkit for short-term rental hosts to analyze pricing, optimize calendars, and draft guest-ready content.

![HostFlow Local screenshot](docs/assets/screenshot.png)

Live site: https://baditaflorin.github.io/hostflow-local/

Repository: https://github.com/baditaflorin/hostflow-local

Support: https://www.paypal.com/paypalme/florinbadita

## Quickstart

```bash
npm install
make dev
make test
make build
make pages-preview
```

## Architecture

HostFlow Local is a Mode A GitHub Pages app. The browser owns import parsing, pricing analysis, calendar recommendations, draft generation, and local persistence. Optional local LLM calls use a user-supplied endpoint; no secrets are bundled or stored by the project.

## What v0.1.0 includes

- Paste-HTML and CSV listing import with Zod-validated `hostflow.listings.v1` records.
- Pricing band, occupancy signal, and 30-day calendar recommendations.
- Listing copy, guest templates, review responses, competitor ranking, and Pandoc-ready Markdown export.
- Lazy DuckDB-WASM neighborhood summary and optional local LLM polish through a user-owned endpoint.
- Version and commit metadata visible in the live GitHub Pages UI.

```mermaid
C4Context
title HostFlow Local Context
Person(host, "Short-term rental host")
System(app, "HostFlow Local", "Static GitHub Pages app")
System_Ext(repo, "GitHub Repository", "Source, docs, and gh-pages artifact")
System_Ext(llm, "Optional local LLM", "User-owned endpoint")
Rel(host, app, "Imports listing data and exports recommendations")
Rel(app, repo, "Links to source and version metadata")
Rel(app, llm, "Optional BYO local prompt completion")
```

ADRs start at `docs/adr/0001-deployment-mode.md`.
