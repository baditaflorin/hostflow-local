# 0047 - Error taxonomy and messaging guidelines

## Status

Accepted

## Context

"No listings found" is not enough for real users.

## Decision

Errors and issues use this taxonomy:

- info: assumption made, result still usable
- warning: result usable but verify a field
- recoverable-error: result not usable yet, input retained, next step available
- fatal-error: parsing could not proceed safely

Every user-facing message includes:

- what happened
- why it happened in host terms
- now what the user can do

## Consequences

- Import failures preserve user data.
- Fixture tests can assert actionable wording.

## Alternatives Considered

- Throw JavaScript errors and catch at UI boundary: rejected because stack traces are not host guidance.
