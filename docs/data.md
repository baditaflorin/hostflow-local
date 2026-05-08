# Data Contract

Mode A v1 does not ship a public data-generation pipeline.

The app accepts user-supplied pasted HTML, CSV, or bundled sample records. Parsed records use schema version `hostflow.listings.v1`.

## Listing fields

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

Exports include schema version and generated timestamp.
