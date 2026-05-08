# 0015 - Deployment topology

## Status

Accepted

## Context

Mode A deployments are GitHub Pages only.

## Decision

Deploy only the static frontend:

- Source branch: `main`
- Publish branch: `gh-pages`
- Public URL: https://baditaflorin.github.io/hostflow-local/
- Runtime backend: none
- Docker: none
- Nginx: none

## Consequences

- The public surface is static files.
- There is no host port, TLS proxy, Prometheus endpoint, or Docker image in Mode A.

## Alternatives Considered

- Docker backend on port 25342: rejected because Mode C is not justified.
