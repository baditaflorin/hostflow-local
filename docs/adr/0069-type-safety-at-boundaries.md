# 0069. Type Safety at Boundaries

- Status: accepted
- Date: 2026-05-09

## Context

The audit found unchecked casts at LLM, DuckDB, report, and fixture boundaries.

## Decision

- Validate external or weakly typed payloads with Zod or explicit narrowing.
- Keep unavoidable casts inside small boundary helpers, not spread through feature logic.
- Remove dead or misleading state variants while tightening types.

## Consequences

- Production code becomes more explicit about what it trusts.
- Test fixtures can still use narrow casts, but only near parsing helpers.

## Alternatives considered

- Rely on structural casts everywhere: rejected because it hides real runtime assumptions.
