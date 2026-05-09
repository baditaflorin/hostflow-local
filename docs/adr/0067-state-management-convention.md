# 0067. State-Management Convention

- Status: accepted
- Date: 2026-05-09

## Context

Local component state and `localStorage` state are mixed directly in `App.tsx`. Phase 3 adds workspace import/export, share URLs, and reset behavior, which need a canonical state shape.

## Decision

- Define a versioned workspace-state schema.
- Persist durable workspace state through one shared storage module.
- Keep short-lived UI state local unless it materially affects recovery or shareability.

## Consequences

- Import text, listings, subject values, generated outputs, and activity can be restored coherently.
- Reset and migration become explicit instead of ad hoc.

## Alternatives considered

- Persist every transient flag: rejected because it would rehydrate stale UI noise.
