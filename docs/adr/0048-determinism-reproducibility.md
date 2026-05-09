# 0048 - Determinism and reproducibility guarantees

## Status

Accepted

## Context

The same input should produce the same normalized records and report body. V1 reports included current timestamps, making byte-identical output impossible.

## Decision

Use deterministic source fingerprints and stable IDs. Report helpers accept an explicit generation timestamp; tests pass a fixed timestamp. The live UI can still include the real generation time in export metadata, but normalized import output must be byte-identical for identical input.

## Consequences

- Fixture outputs are reproducible.
- Exports contain enough parameters to rerun analysis.

## Alternatives Considered

- Remove timestamps entirely: rejected because provenance still needs generation metadata.
