# 0071. Stranger-Test Findings and Response

- Status: accepted
- Date: 2026-05-09

## Context

Phase 3 required a stranger-style pass over the hosted UX, not just unit coverage.

## Decision

Use a Pages-like browser run with a real CSV fixture as the release gate for Phase 3:

- Upload real host data
- Confirm the exported report changes
- Confirm workspace save works

The in-app browser runtime timed out during bootstrap in this environment, so Playwright served as the execution surface for the cold-start browser pass.

## Consequences

- Release confidence is grounded in a real browser workflow, not only model-side reasoning.
- The test remains honest about environment limits while still gating the critical hosted path.

## Alternatives considered

- Skip browser-level verification: rejected.
- Block the release on the flakier full download-and-reupload browser loop: rejected because the workspace round-trip is already covered at the schema/unit level and the browser hang was environment-specific rather than product-specific.
