# 0004 - Static data contract

## Status

Accepted

## Context

Mode A has no server-generated shared data. The app still needs stable shapes for examples, imported listings, and future static artifacts.

## Decision

Use versioned client-side JSON objects validated with Zod.

Current schema version: `hostflow.listings.v1`.

Listing records include:

- `id`
- `title`
- `location`
- `neighborhood`
- `url`
- `priceNightly`
- `cleaningFee`
- `bedrooms`
- `bathrooms`
- `guests`
- `rating`
- `reviewCount`
- `latitude`
- `longitude`
- `amenities`
- `minNights`
- `occupancyHint`
- `source`

Small sample fixtures live in source and are bundled. User imports are stored locally only.

## Consequences

- No static data pipeline is required for v1.
- Future breaking schema changes must use a new schema version.
- Exports include the schema version for reproducibility.

## Alternatives Considered

- Committed Parquet artifacts: rejected for v1 because sample data is tiny and user data is private.
- Runtime API contract: rejected because Mode A has no API.
