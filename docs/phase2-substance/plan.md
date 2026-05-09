# Phase 2 Substance Plan

Date: 2026-05-09

Baseline: v0.1.0, audit commit `49e993b`

Goal: make the existing import → pricing → calendar → copy → messaging → reviews → competitors → export flow useful on messy real host data without adding new product surface area.

## Ranked Work Items

Ranked by impact on the 10 real-data audit inputs.

1. **6 Auto-detect structure** - classify input as competitor listings, reservation history, market benchmark, market calendar, rendered OTA cards, JSON-LD, challenge/error page, empty, or unknown.
2. **7 Auto-classify fields** - map host-world synonyms such as `listing_name`, `guest_count`, `total_price`, `average_daily_rate`, `market_adr`, `reviews`, `Sleeps`.
3. **9 Format normalization by default** - BOM/NBSP cleanup, CRLF/LF, decimal commas, thousands separators, currency symbols/codes, absolute URLs where possible.
4. **15 Domain conventions baked in** - sniff delimiters, prefer semantic HTML, prefer nightly price over total, convert total/nights to ADR.
5. **12 Domain-aware validation** - flag missing currency, total-vs-nightly ambiguity, implausible price, rating scale mismatch, PII-bearing reservation inputs.
6. **16 Confidence scores on every inference** - field confidence, row confidence, shape confidence, and overall import confidence.
7. **32 Actionable errors** - every failure says what failed, why in host terms, and the next step.
8. **33 Validate at boundaries** - one normalized import result schema before analysis consumes records.
9. **13 Recognize common shapes** - OTA cards, CSV exports, reservation exports, benchmark summaries, market history, WAF/challenge pages.
10. **14 Domain-aware export** - export confidence, source shape, parameters, anomalies, and provenance.
11. **18 Surface anomalies** - outlier rates, mixed total/nightly data, missing capacity, PII columns, unsupported calendar-only rows.
12. **19 Explain decisions** - record why each field was inferred and expose it in debug/export.
13. **35 Deterministic outputs** - stable IDs, stable ordering, deterministic normalized output/report in tests.
14. **38 Output provenance** - source fingerprint, schema version, app version, import strategy, pricing parameters.
15. **1 Fuzz the parser** - real fixtures plus synthetic empty/huge/malformed/encoding/structural edge cases.
16. **2 Encoding and format variants** - documented normalization policy and tests.
17. **4 Partial inputs** - truncated HTML/CSV should yield partial rows plus warnings, not crashes.
18. **5 Adversarial input** - broken tags, embedded CSV commas/newlines, trailing commas, Unicode lookalikes.
19. **24 State taxonomy** - enumerate intentional states and map UI behavior.
20. **25 No stuck states** - every recoverable state has a clear action.
21. **27 Concurrency safety** - repeated Parse/DuckDB/LLM clicks should not race state.
22. **28 Profile real-data inputs** - collect median/p95/worst paste-to-preview numbers.
23. **31 Cache expensive things** - avoid redoing parse/analysis for identical input fingerprints.
24. **37 Debug surface** - `?debug=1` exposes shape, confidence, field reasons, performance marks.
25. **22 Stable IDs everywhere** - deterministic IDs from source shape + stable content.
26. **34 Recoverable vs fatal explicit** - typed import outcomes preserve user data on recoverable failures.
27. **36 Inspectable history** - local activity log for imports and exports.
28. **39 Remember user corrections within session** - limited to inferred field/source-shape choices if a correction UI is touched; otherwise deferred.

## Expected Real-Data Impact

- Inputs 2, 3, and 4 stop producing wrong-confident nightly prices.
- Inputs 5, 6, 7, 8, and 9 stop dead-ending at generic "No listings found."
- Input 10 identifies challenge/error pages in domain terms.
- Input 1 gains transparency through confidence and provenance rather than more UI setup.

## Implementation Order

1. Fixtures and expected outcomes.
2. ADRs 0040-0050.
3. Normalization and shape classifier.
4. Field inference and confidence model.
5. Domain-aware price/rating/date/capacity parsing.
6. Import result schema, actionable errors, anomalies.
7. UI wiring with same surface area.
8. Export provenance and deterministic report helpers.
9. Debug surface, activity history, concurrency guards.
10. Real-data tests, fuzz tests, performance docs, postmortem, release.
