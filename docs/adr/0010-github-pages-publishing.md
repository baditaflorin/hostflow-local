# 0010 - GitHub Pages publishing strategy

## Status

Accepted

## Context

The repository needs project documentation under `docs/` and a built frontend served by GitHub Pages. Publishing from `main /docs` would conflict with ADR and documentation files.

## Decision

Publish GitHub Pages from the `gh-pages` branch root.

The main branch keeps source code and project documentation. `npm run build` emits a Pages-ready `dist/` directory with base path `/hostflow-local/`, hashed assets, and a copied `404.html` SPA fallback. The `gh-pages` branch stores the built artifact at its root with `.nojekyll`.

Live URL: https://baditaflorin.github.io/hostflow-local/

## Consequences

- `dist/` stays ignored on `main` because it is generated.
- The publish artifact still lands in the repository on the `gh-pages` branch.
- Rollback is a branch revert or force-publish of an earlier generated artifact.

## Alternatives Considered

- `main /docs`: rejected because `docs/adr` and other markdown docs must not be overwritten by Vite.
- `main /`: rejected because placing generated app files at repo root would mix source and build artifacts.
