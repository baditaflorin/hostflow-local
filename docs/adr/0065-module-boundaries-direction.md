# 0065. Module Boundaries and Dependency Direction

- Status: accepted
- Date: 2026-05-09

## Context

`App.tsx` and `inferImport.ts` currently own too many concerns, and new completeness work would worsen that if left unchecked.

## Decision

Use this direction:

- `components` render props and fire events.
- `features/*` own domain logic.
- `lib/*` owns generic browser utilities, persistence, serialization, and build metadata.
- `App.tsx` coordinates state and high-level actions but delegates mechanics to feature/lib modules.

## Consequences

- New file import, workspace export, share, and copy helpers live outside components.
- Large modules should be split when the split removes real responsibility overlap.

## Alternatives considered

- Full architectural rewrite: rejected as disproportionate for Phase 3.
