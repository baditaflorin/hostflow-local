# 0001 - Deployment mode

## Status

Accepted

## Context

HostFlow Local replaces a paid short-term rental host workflow with a private tool for pricing analysis, calendar optimization, listing copy, guest templates, review drafts, and competitor analysis. The bootstrap requires GitHub Pages first and a runtime backend only when static delivery is insufficient.

## Decision

Use Mode A: Pure GitHub Pages.

The app is a static Vite/React bundle published from the `gh-pages` branch. Users paste or import listing HTML/CSV locally. Parsing, analysis, draft generation, export, and persistence run in the browser. Optional LLM completion uses a user-supplied local endpoint, such as Ollama, and is never called automatically.

## Consequences

- No runtime server, database, hosted auth, or backend secrets.
- GitHub Pages is the only deployment surface for v1.
- Heavy browser modules, especially DuckDB-WASM, must be lazy-loaded.
- Cross-device sync and automated platform actions are out of scope.

## Alternatives Considered

- Mode B with pre-built data artifacts: rejected because v1 relies on user-supplied private listing data rather than a shared public dataset.
- Mode C with Docker backend: rejected because v1 has no runtime secrets, auth, mutations, or shared database requirement.
