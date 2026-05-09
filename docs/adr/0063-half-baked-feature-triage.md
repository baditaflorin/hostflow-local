# 0063. Half-Baked Feature Triage

- Status: accepted
- Date: 2026-05-09

## Context

Several features are real but incomplete: import, export, local LLM polish, persistence, and documentation claims.

## Decision

- Finish import by adding file, drag/drop, clipboard, batch, and reset flows.
- Finish export by adding workspace round-trip plus copy/structured outputs.
- Finish local LLM support with validation and clearer failure messaging.
- Finish persistence with migrations and reset.
- Keep DuckDB summary as an on-demand analytic helper.
- Do not add unrelated new product areas.

## Consequences

- The UI gains a few utility controls, but no new domain tabs are introduced.
- Features that remain unsupported must say so explicitly.

## Alternatives considered

- Hide import/export complexity and keep the demo shape: rejected because that preserves the toy feeling.
- Delete local LLM support: rejected because it already works and only needs honesty and guardrails.
