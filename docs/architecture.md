# Architecture

HostFlow Local is a Mode A GitHub Pages application.

Live site: https://baditaflorin.github.io/hostflow-local/

Repository: https://github.com/baditaflorin/hostflow-local

## Context

```mermaid
C4Context
title HostFlow Local Context
Person(host, "Short-term rental host")
System_Boundary(pages, "GitHub Pages") {
  System(app, "HostFlow Local", "Static React app")
}
System_Ext(browser, "Browser storage", "localStorage today; IndexedDB/OPFS later")
System_Ext(llm, "Optional local LLM", "User-owned endpoint, no bundled secrets")
System_Ext(repo, "GitHub Repository", "Source, ADRs, and gh-pages artifact")
Rel(host, app, "Imports data, reviews recommendations, exports drafts")
Rel(app, browser, "Stores local workspace state")
Rel(app, llm, "Optional prompt completion")
Rel(app, repo, "Links to source and displays build metadata")
```

## Container

```mermaid
C4Container
title HostFlow Local Container View
Person(host, "Short-term rental host")
System_Boundary(device, "User device") {
  Container(ui, "React UI", "TypeScript", "Workflow tabs, import forms, recommendations")
  Container(logic, "Domain logic", "TypeScript", "Parsing, pricing, calendar, drafts")
  ContainerDb(storage, "Browser storage", "localStorage", "Private local workspace")
  Container(wasm, "DuckDB-WASM", "WASM", "Lazy SQL summaries")
}
System_Ext(pages, "GitHub Pages", "Static file hosting")
Rel(host, ui, "Uses")
Rel(pages, ui, "Serves static files")
Rel(ui, logic, "Calls")
Rel(logic, storage, "Reads/writes")
Rel(ui, wasm, "Loads on demand")
```
