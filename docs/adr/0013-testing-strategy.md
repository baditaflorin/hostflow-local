# 0013 - Testing strategy

## Status

Accepted

## Context

The app has parsing and recommendation logic that can regress independently from React rendering.

## Decision

Use:

- Vitest for domain unit tests.
- Happy DOM for parser tests that need DOM APIs.
- Playwright for a static smoke happy path.
- `make test`, `make lint`, and `make smoke` for local verification.

Coverage target is at least 70 percent for logic modules once feature tests are present.

## Consequences

- Hooks can run fast enough before push.
- E2E coverage focuses on one happy path in v1.

## Alternatives Considered

- GitHub Actions: rejected by the bootstrap constraints.
- Manual-only QA: rejected because parser and pricing logic need repeatable checks.
