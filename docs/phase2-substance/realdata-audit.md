# Phase 2 Substance - Real-Data Audit

Audit date: 2026-05-08

Baseline: HostFlow Local v0.1.0, commit `5c0a204`

Live app: https://baditaflorin.github.io/hostflow-local/

Repository: https://github.com/baditaflorin/hostflow-local

## Source Basis

The audit uses real-world host input shapes from public product documentation, live web responses, and common paste-from-browser OTA card structures:

- Hospitable Reservations & Financials export columns: https://help.hospitable.com/en/articles/5651284-what-does-the-reservations-financials-export-include
- Autohost reservation CSV import fields: https://help.autohost.ai/knowledge/importing-reservations-using-csv
- PriceLabs Revenue Estimator CSV/PDF export context: https://help.pricelabs.co/portal/en/kb/articles/understanding-getting-started-pricelabs-revenue-estimator-pro
- PriceLabs Neighborhood Data / Market History metrics: https://help.pricelabs.co/portal/en/kb/articles/listing-market-data
- Booking.com live search response, captured 2026-05-08, returned an AWS WAF challenge page rather than rendered listing cards.

No ADRs, fixtures, or code changes are part of this audit.

## Ten Inputs

### 1. Clean Comparable Listings CSV

Input shape:

```csv
title,location,neighborhood,price,bedrooms,bathrooms,guests,rating,reviews,amenities,occupancy
"Sunny Flat","Bucharest","Old Town",120,2,1,4,4.8,122,"wifi; balcony",0.76
```

What v1 did: Parsed the row as one listing and produced pricing, calendar, copy, messages, reviews, competitor ranking, and export.

What it should have done: Same, plus show inferred field types, confidence, currency assumption, and source metadata.

Why it failed if it did: It did not fail on the happy path, but it silently assumed USD and did not explain that `occupancy` was interpreted as `occupancyHint`.

Failure mode: Mostly correct, but under-explained.

Manual work the app forced: User has to trust hidden assumptions about currency and field mapping.

### 2. Airbnb Search Results Copied Text/HTML Card

Input shape:

```html
<article>
  <a href="/rooms/123">Guest favorite home in Lisbon</a>
  <div>$182 total before taxes · $91 night</div>
  <div>4.92 · 143 reviews</div>
  <div>2 bedrooms · 3 beds · 1 bath · 4 guests</div>
</article>
```

What v1 did: Detected one listing but chose the first money token, treating `$182 total` as the nightly rate instead of `$91 night`.

What it should have done: Prefer the explicitly nightly price, preserve the total price separately, and warn when both total and nightly prices are present.

Why it failed: The price parser grabs the first currency-like number without domain semantics.

Failure mode: Wrong-but-confident.

Manual work the app forced: User has to notice the price is doubled and correct the dataset outside the app.

### 3. Booking.com Rendered Property Card

Input shape:

```html
<div data-testid="property-card">
  <h3>Central Studio with Balcony</h3>
  <span>Scored 8.8</span>
  <span>1 studio apartment · 2 guests</span>
  <span>€312 for 2 nights</span>
  <span>Includes taxes and charges</span>
</div>
```

What v1 did: Detected a listing and a price, but treated `€312 for 2 nights` as the nightly rate. It missed the Booking-style `Scored 8.8` rating and did not infer that studio equals one bedroom.

What it should have done: Normalize total stay price to nightly price, convert Booking's 10-point score to a comparable confidence-aware rating, and infer studio as one sleeping unit.

Why it failed: No OTA-specific price-period or rating-scale logic.

Failure mode: Wrong-but-confident on price, silent missing rating.

Manual work the app forced: User has to divide totals by stay length and normalize ratings manually.

### 4. Vrbo Search Card With Thousands Separator

Input shape:

```html
<article>
  <h2>Lake house with dock</h2>
  <p>Sleeps 6 · 2 bedrooms · 2 bathrooms</p>
  <p>$1,260 total · $210 per night</p>
  <p>4.9 Exceptional (64 reviews)</p>
</article>
```

What v1 did: Detected the card but parsed `$1,260` as approximately `1.26` because comma handling treats it as a decimal separator. It also missed `Sleeps 6` as guest capacity.

What it should have done: Detect thousands separators, prefer `$210 per night`, and interpret `Sleeps 6` as guest capacity.

Why it failed: Number normalization is not locale- or domain-aware; capacity patterns are too narrow.

Failure mode: Wrong-but-confident and severe.

Manual work the app forced: User has to repair price and capacity before any recommendation is meaningful.

### 5. Hospitable Reservations & Financials CSV

Input shape based on Hospitable's documented columns:

```csv
uuid,checkin_date,checkout_date,platform,listing_id,listing_name,guest_count,nights,currency,total_price,cleaning_fee,review_rating
5fa560d6,44627,44634,airbnb,6789900,Luxury Starred Rock Villa,6,6,EUR,1450.00,85.00,4
```

What v1 did: Returned no listings because `listing_name`, `guest_count`, and `total_price` are not recognized as title, guests, or price fields.

What it should have done: Recognize this as reservation history, derive ADR as `total_price / nights`, map `listing_name`, preserve platform/currency, and explain that this is not competitor data.

Why it failed: CSV parsing only supports a small comparable-listing schema and has no shape classification.

Failure mode: Recoverable but vague; the user sees "No listings found" without a domain next step.

Manual work the app forced: User has to rename columns or pre-transform reservation data into competitor-style rows.

### 6. Autohost Reservation CSV

Input shape based on Autohost's documented CSV fields:

```csv
status,source,confirmation_code,number_of_guests,total_price,check_in_date,check_out_date,listing_id,first_name,last_name,email,phone,location,birth_date
CONFIRMED,Airbnb,abc1556,2,156,12-05-2025 11:00:00,12-10-2025 16:00:00,AWiWXnMn8a4,James,Bond,james@example.com,+15555550123,London,
```

What v1 did: Returned no listings. It did not recognize `number_of_guests`, `total_price`, or date ranges.

What it should have done: Classify as reservation data, calculate nights and ADR, and keep guest PII out of exported recommendation text unless explicitly requested.

Why it failed: No reservation-data path, no PII detection, no date parsing.

Failure mode: Recoverable but vague.

Manual work the app forced: User has to delete or rename columns and manually compute ADR.

### 7. PriceLabs Revenue Estimator Summary CSV

Input shape based on PriceLabs Revenue Estimator concepts:

```csv
estimate_name,address,bedrooms,currency,annual_revenue,average_daily_rate,monthly_revenue,adjusted_occupancy,comp_set_listings
Downtown 2BR,"Bucharest, Romania",2,EUR,28600,132,2383,0.72,84
```

What v1 did: Returned no listings because it does not map `average_daily_rate`, `adjusted_occupancy`, or `comp_set_listings`.

What it should have done: Classify as a market benchmark summary, seed the subject listing assumptions, and produce a cautious pricing baseline with low row-level detail confidence.

Why it failed: No schema inference beyond exact or near-exact v1 headers.

Failure mode: Recoverable but vague.

Manual work the app forced: User has to manually copy ADR and occupancy into subject inputs.

### 8. PriceLabs Neighborhood Data / Market History CSV

Input shape based on PriceLabs market history metrics:

```csv
date,occupancy,booking_window,market_adr,length_of_stay
2026-06-01,0.74,28,141,3.2
2026-06-02,0.71,24,139,3.0
```

What v1 did: Treated the input as HTML because the header does not include v1's CSV sniff keywords, then returned no listings.

What it should have done: Sniff it as CSV, classify it as market calendar data, and use it to improve calendar recommendations rather than competitor ranking.

Why it failed: CSV detection is too brittle and tied to listing rows only.

Failure mode: Silent-ish dead end with generic "No listings found."

Manual work the app forced: User has to understand why an obviously tabular export was ignored.

### 9. European Semicolon CSV With BOM, NBSP, Decimal Commas

Input shape:

```text
﻿Titre;Quartier;Prix nuit;Chambres;Voyageurs;Note;Avis
"Studio lumineux";"Le Marais";"95,50 €";1;2;"4,87";"128"
```

What v1 did: Did not treat it as CSV because it looks for commas, then returned no listings.

What it should have done: Normalize BOM/NBSP/smart punctuation, sniff semicolon delimiter, parse decimal commas, infer French headers, and preserve EUR.

Why it failed: No encoding, delimiter, locale, or header synonym policy.

Failure mode: Recoverable but vague.

Manual work the app forced: User has to re-save the export with English headers and comma delimiters.

### 10. Live Booking.com Search Response / Challenge Page

Input shape:

The live URL `https://www.booking.com/searchresults.html?...` returned an AWS WAF challenge page containing `challenge.js` and `challenge-container`, not listing cards.

What v1 did: Returned no listings.

What it should have done: Detect the anti-bot/challenge page in domain terms and say: "This is not a rendered listing page. Open the page in your browser, copy the visible cards, or import a CSV export."

Why it failed: No common-shape classifier for challenge/login/error pages.

Failure mode: Recoverable but vague.

Manual work the app forced: User has to infer that they pasted the wrong layer of the site.

## Top 5 Logic Gaps

1. Price extraction is first-token based, so total prices, nightly prices, thousands separators, and locale decimals are confused. This creates wrong-but-confident pricing.
2. CSV understanding is header-exact and delimiter-naive. Real exports using `listing_name`, `total_price`, `average_daily_rate`, semicolons, BOMs, or decimal commas are rejected or misread.
3. The app has no input-shape classifier. Competitor listings, reservation histories, market summaries, market calendars, challenge pages, and partial pages all collapse into "listings or nothing."
4. Domain inference is too shallow. It does not infer `Sleeps 6`, "studio", Booking 10-point scores, `total / nights = ADR`, or platform-specific date/price semantics.
5. Confidence and provenance are missing from inferred fields. Exports look authoritative even when core fields were guessed, defaulted, or not understood.

## Top 3 Intuition Failures

1. A user pastes a real CSV export and gets "No listings found" even though the data obviously contains prices, dates, guests, and listing names.
2. A user pastes a card with both total and nightly price and the app silently chooses the wrong one.
3. The export does not reveal which values were imported, inferred, defaulted, or low confidence.

## Top 3 "Feels Stupid" Moments

1. The user must rename normal host columns like `listing_name`, `guest_count`, `total_price`, and `average_daily_rate`.
2. The user must manually divide stay totals by nights when the input literally says "for 2 nights" or includes `nights`.
3. The user must explain obvious domain vocabulary: "Sleeps 6" means guests, "studio" is comparable to one bedroom, and Booking's "Scored 8.8" is a rating.

## What "Smart" Means For HostFlow Local

1. Pasted OTA cards should produce a useful first pass without setup: title, URL, nightly price, total price, guests, bedrooms, bathrooms, rating, reviews, and platform confidence.
2. Real CSV exports should be classified before parsing: competitor listing, reservation history, market benchmark, market calendar, or unsupported/challenge/error page.
3. Every inferred field should carry confidence and a short reason, and low-confidence fields should be visible in the UI and export.
4. Pricing logic should prefer domain-correct values: nightly over total, ADR from total/nights, numeric locale normalization, and platform rating-scale normalization.
5. Failure should be actionable in host language: what was pasted, why it was not usable yet, and the next best step.

## Phase 2 Substance Success Metrics

- Real-data primary-flow pass rate: at least 7 of the 10 audited inputs produce a useful first guess without manual column renaming or pre-cleaning.
- No wrong-confident prices: 100% of fixtures with total and nightly prices either select the nightly price correctly or mark price confidence low with an explanation.
- CSV robustness: delimiter sniffing, BOM stripping, CRLF/LF handling, decimal comma parsing, and header synonym mapping pass on all CSV fixtures.
- Determinism: same fixture input produces byte-identical normalized output and report body on 10 consecutive runs.
- Failure quality: every unsupported fixture returns a domain-specific what/why/now-what message; no generic "No listings found" remains for audited inputs.
- Performance: median paste-to-preview under 1 second for the 10 fixtures; 5 MB input shows progress or a cancellable operation rather than freezing silently.
- Export provenance: every exported artifact includes schema version, app version, source shape, field confidence, and pricing parameters used.

## Out Of Scope For Phase 2 Substance

- No new product surface area beyond the existing import, pricing, calendar, copy, messages, reviews, competitors, DuckDB, LLM, and export flow.
- No visual polish, theming, onboarding, landing page, command palette, or new decorative UI.
- No architecture escalation beyond Mode A GitHub Pages.
- No live scraping, login automation, platform writes, or secret-bearing backend.
- No cross-device sync or accounts.
- No large public geodata pipeline unless a later confirmed plan explicitly selects Mode B for data artifacts.
- No Phase 3 interaction-learning work unless confirmed after the §2 plan.
