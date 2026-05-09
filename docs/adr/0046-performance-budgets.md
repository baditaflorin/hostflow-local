# 0046 - Performance budgets

## Status

Accepted

## Context

Large pasted pages can stall the UI if parsing happens synchronously without progress.

## Decision

Budgets:

- Normal fixture paste-to-preview median: under 1 second.
- Operation over 300 ms: record a performance mark.
- Operation over 5 seconds: must be cancellable or documented as a performance gap.
- 5 MB input: must not silently freeze; show parsing state and retain prior data on failure.

Measure with `performance.now()` in the import path and fixture performance tests.

## Consequences

- Performance numbers go into the Phase 2 postmortem.
- Heavy worker migration is justified only if measured parsing exceeds the budget.

## Alternatives Considered

- Optimize without measurement: rejected because performance honesty is an explicit bar.
