# 0005 - Client-side storage strategy

## Status

Accepted

## Context

Users need their most recent imports, assumptions, and drafts to survive refreshes. Cross-device sync is not a v1 requirement.

## Decision

Use `localStorage` for v1 state:

- imported listings
- subject listing assumptions
- active tab
- optional local LLM endpoint and model

Large future data can move to IndexedDB or OPFS behind the same storage wrapper.

## Consequences

- No auth or server persistence.
- State remains on the user's device and can be cleared from the browser.
- Storage failures degrade to in-memory state.

## Alternatives Considered

- IndexedDB: more scalable, but heavier than needed for v1.
- Server database: rejected because it would force Mode C without a v1 need.
