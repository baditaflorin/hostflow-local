# 0049 - Inspectability and debug surface

## Status

Accepted

## Context

Power users and support need to see why the app inferred a field.

## Decision

`?debug=1` reveals import shape, confidence, field reasons, issues, anomalies, source fingerprint, and performance timings. The debug surface is read-only and does not add product workflow.

## Consequences

- Inference decisions are inspectable.
- The same data is available to exports for provenance.

## Alternatives Considered

- Hide internals until support asks: rejected because Phase 2 requires no silent wrongness.
