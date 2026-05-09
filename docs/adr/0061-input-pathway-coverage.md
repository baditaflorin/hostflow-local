# 0061. Input Pathway Coverage

- Status: accepted
- Date: 2026-05-09

## Context

The app currently assumes users paste data manually. Real users more often start from downloaded CSV files, mobile file pickers, drag-and-drop, or clipboard buttons.

## Decision

Phase 3 supports these input pathways in-browser:

- Text/HTML paste
- File upload
- Drag-and-drop for files and text
- Clipboard read with permission handling
- URL hint flow with explicit CORS limits
- Multi-file batch import
- Full workspace JSON import

Folder import is explicitly out of scope for v0.3.0.

## Consequences

- The import surface becomes a real intake area instead of a single textarea.
- Input handling needs a normalized import-source abstraction.
- The browser app stays Mode A because all parsing remains client-side.

## Alternatives considered

- Keep paste as the only import path: rejected because it blocks normal host workflows.
- Add a backend fetch proxy for URLs: rejected because Mode A remains sufficient and runtime scraping would escalate architecture.
