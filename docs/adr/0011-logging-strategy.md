# 0011 - Logging strategy

## Status

Accepted

## Context

Mode A has no server logs. Browser logging should help development without leaking user data or creating production noise.

## Decision

Use minimal browser console logging in development only. Production builds avoid routine console output. User-facing failures appear as inline error states and toasts.

## Consequences

- No server log infrastructure is required.
- Imported listing data is not printed in production.

## Alternatives Considered

- Structured client log collection: rejected because v1 has no analytics endpoint and no consent flow.
