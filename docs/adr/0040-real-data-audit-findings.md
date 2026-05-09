# 0040 - Real-data audit findings and substance success metrics

## Status

Accepted

## Context

The v0.1.0 app worked on curated sample data but failed on normal host inputs: OTA cards with total and nightly prices, reservation exports, PriceLabs summaries, European CSV formats, and challenge pages.

## Decision

Use `docs/phase2-substance/realdata-audit.md` and `test/fixtures/realdata/` as the Phase 2 grading rubric. Phase 2 is successful when at least 7 of 10 fixtures produce a useful first guess, no fixture returns a wrong-confident price, and unsupported inputs explain what/why/next step in host language.

## Consequences

- Real-data fixtures block regressions.
- Synthetic fuzz cases can supplement, but not replace, real fixtures.
- The postmortem must report fixture pass rate before and after.

## Alternatives Considered

- Continue testing only sample listings: rejected because it would preserve the toy failure mode.
