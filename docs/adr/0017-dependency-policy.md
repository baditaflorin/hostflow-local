# 0017 - Dependency policy

## Status

Accepted

## Context

The bootstrap asks for battle-tested libraries and no custom implementation where a strong option exists.

## Decision

Use established production dependencies for core concerns:

- Vite and React for the app shell.
- Tailwind CSS for styling.
- Zod for validation.
- TanStack Query for async state.
- DuckDB-WASM for optional SQL analysis.
- Lucide for icons.
- Vitest and Playwright for verification.

Dependencies must pass `npm audit` without high or critical vulnerabilities before release.

## Consequences

- Custom code focuses on host workflow logic.
- New dependencies require a clear feature reason.

## Alternatives Considered

- Hand-rolled UI and validation stack: rejected because it would add risk without product value.
