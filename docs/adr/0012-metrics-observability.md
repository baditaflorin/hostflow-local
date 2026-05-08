# 0012 - Metrics and observability

## Status

Accepted

## Context

The bootstrap defaults Mode A/B to no server-side metrics and privacy-respecting analytics only if needed.

## Decision

Ship v1 with no analytics. Observability consists of local error states, deterministic tests, and visible build metadata in the UI.

## Consequences

- No PII or behavioral data is collected.
- Usage metrics are unavailable unless users report feedback.

## Alternatives Considered

- Plausible analytics: deferred until there is a clear product question and a privacy notice update.
- Self-hosted beacon: rejected because it would introduce runtime infrastructure.
