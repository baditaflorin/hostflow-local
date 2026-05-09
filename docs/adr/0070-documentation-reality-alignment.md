# 0070. Documentation-Reality Alignment

- Status: accepted
- Date: 2026-05-09

## Context

Phase 3 found several claims that were directionally true but broader than the shipped UX, especially around import and export.

## Decision

- README claims must map to tested user-visible behaviors.
- When a pathway is intentionally out of scope, the docs say so plainly.
- The live Pages URL, repository link, PayPal link, version, and commit remain first-class docs and UI signals.

## Consequences

- Docs updates are part of shipping, not a cleanup chore.
- Quickstart and capability descriptions must stay honest after version bumps.

## Alternatives considered

- Leave aspirational language in place: rejected because it undermines user trust.
