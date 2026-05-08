# 0003 - Frontend framework and build tooling

## Status

Accepted

## Context

The app needs strict TypeScript, a fast local developer loop, GitHub Pages-friendly static output, and production-ready UI libraries.

## Decision

Use React, TypeScript strict mode, Vite, Tailwind CSS, Zod, TanStack Query, Lucide icons, Vitest, and Playwright.

## Consequences

- Vite handles hashed assets and the `/hostflow-local/` base path.
- React keeps the workflow interactive without a server.
- Tailwind provides utility styling while small project CSS handles domain-specific surfaces.
- TypeScript and Zod guard the import boundary.

## Alternatives Considered

- SvelteKit static adapter: attractive, but React/Vite has broader library support for this workflow.
- Plain TypeScript without a framework: rejected because tabs, forms, drafts, and local state would become noisy quickly.
