# 0050 - Interaction-learning policy

## Status

Accepted

## Context

Remembering corrections can make the app feel smarter, but hidden changing defaults can feel spooky.

## Decision

Phase 2 limits learning to transparent session-local preferences:

- last successful import shape
- last user-entered subject listing assumptions
- activity history of imports and exports

No persistent cross-session model training, hidden remapping, or remote learning is added.

## Consequences

- The app can retain useful local context without surprising the user.
- Broader correction learning is a Phase 3 candidate.

## Alternatives Considered

- Auto-learn field remaps silently: rejected because it would obscure determinism.
