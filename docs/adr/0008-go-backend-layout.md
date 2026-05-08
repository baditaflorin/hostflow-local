# 0008 - Go backend layout

## Status

Accepted

## Context

The bootstrap defines a Go layout for Modes B and C.

## Decision

Skip the Go backend layout in Mode A. There is no `cmd/`, `internal/`, `pkg/`, API server, Dockerfile, or runtime service in v1.

## Consequences

- The repository remains frontend-only.
- Backend hooks and targets are omitted or no-op where the Makefile needs a consistent surface.

## Alternatives Considered

- Add an empty Go module for future use: rejected because unused scaffolding adds maintenance without value.
