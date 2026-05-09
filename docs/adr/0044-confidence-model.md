# 0044 - Confidence model

## Status

Accepted

## Context

The v1 app produced authoritative-looking output even when values were guessed or defaulted.

## Decision

Every import result has:

- shape confidence
- row confidence
- field confidence for title, price, currency, capacity, bedrooms, bathrooms, rating, reviews, dates, and URL
- reason strings for each inferred field
- issue severity: info, warning, error

Overall import confidence is the average of shape confidence and row confidences, reduced by warnings and errors.

## Consequences

- Low-confidence values can be surfaced in the UI and export.
- Wrong-confident output becomes a test failure.

## Alternatives Considered

- Confidence only at row level: rejected because users need to know which field is uncertain.
