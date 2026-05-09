# 0066. Error-Handling Convention

- Status: accepted
- Date: 2026-05-09

## Context

The app currently mixes import notices with generic errors from unrelated features. Real users need domain-specific errors with clear next steps.

## Decision

All user-facing errors should include:

- What failed
- Why it failed in host language
- What to do next

Feature-local actions should return structured status where possible. Global notices remain lightweight and should not hide feature-specific guidance.

## Consequences

- Import, file handling, clipboard, LLM, and workspace restore flows need actionable messages.
- Generic `"did not initialize"` and `"request failed"` wording should be tightened.

## Alternatives considered

- Keep terse developer-style errors: rejected because they fail the stranger test.
