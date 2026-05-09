# 0043 - Domain vocabulary and UI language conventions

## Status

Accepted

## Context

Generic parser errors force users to understand implementation details. Phase 2 requires errors and labels in host terms.

## Decision

Use host vocabulary:

- "reservation history" instead of "unsupported schema"
- "nightly rate" instead of "price field"
- "total stay price" instead of "first currency match"
- "market calendar" instead of "date rows"
- "challenge page" instead of "empty DOM"

## Consequences

- Error messages can be audited for what/why/now-what.
- UI and export language align with the domain.

## Alternatives Considered

- Keep technical labels and add tooltips later: rejected because Phase 2 is substance, not polish.
