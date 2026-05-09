# 0068. Persistence Schema and Migration

- Status: accepted
- Date: 2026-05-09

## Context

Persistence currently stores several keys independently with no explicit migration plan and no import/export contract.

## Decision

- Introduce one versioned workspace export/import schema.
- Continue using `localStorage` for Phase 3.
- Add migration helpers for older stored shapes when feasible.
- Add a factory reset action that clears workspace keys intentionally.

## Consequences

- Export/import round-trip can be tested.
- Future schema changes have a single contract to evolve.

## Alternatives considered

- Move to IndexedDB now: rejected because the current data size does not justify the complexity.
