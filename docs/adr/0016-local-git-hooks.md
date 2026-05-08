# 0016 - Local git hooks

## Status

Accepted

## Context

The project must use local hooks instead of GitHub Actions.

## Decision

Use plain `.githooks/` wired through `git config core.hooksPath .githooks`.

Hooks:

- `pre-commit`: lint, format check, typecheck, and `gitleaks protect --staged`.
- `commit-msg`: Conventional Commits validation.
- `pre-push`: `make test`, `make build`, and `make smoke`.
- `post-merge` and `post-checkout`: install dependencies when package metadata changes.

## Consequences

- Checks run locally before commits and pushes once hooks are installed.
- Contributors need local Node and gitleaks.

## Alternatives Considered

- Lefthook: useful, but plain hooks are easier to audit in a small repo.
