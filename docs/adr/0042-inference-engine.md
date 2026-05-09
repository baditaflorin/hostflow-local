# 0042 - Inference engine

## Status

Accepted

## Context

The app needs to infer structure and fields instead of requiring users to rename columns or clean pasted cards.

## Decision

Add an import inference engine with these stages:

1. Normalize raw input.
2. Classify shape: competitor listings, OTA cards, reservation history, market benchmark, market calendar, JSON-LD, challenge page, empty, unknown.
3. Infer fields from header synonyms, textual patterns, and domain phrases.
4. Emit normalized records, market rows, issues, anomalies, confidence, and reasons.

## Consequences

- Existing analysis can keep consuming listing-like records.
- Non-listing shapes can still produce useful state or actionable guidance.
- The parser becomes inspectable through debug output and tests.

## Alternatives Considered

- Add one-off mappings inside the old parser: rejected because shape and confidence would remain implicit.
