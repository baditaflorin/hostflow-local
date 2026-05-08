# 0007 - Data generation pipeline

## Status

Accepted

## Context

The bootstrap includes a Mode B pipeline ADR when pre-built data is used.

## Decision

No data-generation pipeline is used in Mode A v1. `make data` is intentionally absent because there are no public artifacts to generate, commit, or upload.

## Consequences

- User data never leaves the browser because of a scheduled backend job.
- Future public datasets, such as GeoNames extracts, require a new ADR before adding Mode B-style artifacts.

## Alternatives Considered

- Commit GeoNames/libosmscout extracts now: rejected because v1 only needs user-provided coordinates and lightweight local heuristics.
