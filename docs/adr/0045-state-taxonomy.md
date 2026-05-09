# 0045 - State taxonomy and state machine

## Status

Accepted

## Context

Real-data flows need intentional states for empty, partial, recoverable, fatal, and in-progress inputs.

## Decision

Document states in `docs/phase2-substance/states.md` and model imports as:

- idle
- parsing
- loaded-empty
- loaded-some
- loaded-many
- loaded-partial
- recoverable-error
- fatal-error
- cancelled

Every state must have at least one user-actionable exit.

## Consequences

- UI copy and controls follow state, not incidental booleans.
- No stuck states are allowed in fixture tests.

## Alternatives Considered

- Keep ad hoc status strings: rejected because they do not cover partial and recoverable outcomes.
