# 0009 - Configuration and secrets management

## Status

Accepted

## Context

Mode A must not put secrets in the frontend. Optional local LLM usage needs configuration without hiding credentials in the bundle.

## Decision

The app ships with no secrets. Build-time constants are public metadata only:

- app version
- git commit
- repository URL
- PayPal URL

Optional local LLM endpoint and model are entered by the user in the browser and stored in localStorage. `.env.example` documents the non-secret default endpoint.

## Consequences

- No API keys or private tokens are committed.
- Gitleaks runs in the pre-commit hook.
- BYO-key hosted APIs are not part of v1.

## Alternatives Considered

- Put provider API keys in env vars at build time: rejected because static bundles expose them.
- Runtime backend proxy: rejected because v1 avoids Mode C.
