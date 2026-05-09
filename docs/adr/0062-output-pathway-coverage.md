# 0062. Output Pathway Coverage

- Status: accepted
- Date: 2026-05-09

## Context

Markdown download exists, but real users need reusable state, structured exports, clipboard actions, and a print path.

## Decision

Phase 3 makes these output pathways first-class:

- Markdown download
- Markdown copy
- Workspace JSON export/import
- Comparable-data CSV export
- Comparable-data JSON export
- Small-state share URL
- Browser print view
- One-click copy for generated text blocks

## Consequences

- Export is no longer just a report; it becomes a workflow handoff surface.
- Output schemas need versioning and tests.

## Alternatives considered

- Keep Markdown as the only export: rejected because it is not enough for repeat work.
- Add a server API instead: rejected because structured exports solve the real problem without leaving Mode A.
