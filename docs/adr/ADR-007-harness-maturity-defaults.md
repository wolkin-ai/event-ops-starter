# ADR-007 Harness Maturity Defaults

## Status

Accepted

## Context

This starter already had local-first boundaries and project-local skills, but
the harness still had gaps that typically appear once multiple agents and
longer-lived product work start to accumulate:

- route validation patterns can drift
- local debugging can become opaque
- sample assets and docs can decay quietly
- review automation can stay manual for too long
- teams may start parallel agent work without clear isolation rules

## Decision

We adopt the following defaults:

1. Route handlers use shared request/response contract helpers.
2. Local observability starts with structured logs and request IDs, not with a hosted backend.
3. Harness cleanliness is checked by script and by a scheduled GitHub workflow.
4. Review execution is routed through a review suite with explicit trigger and blocking policies.
5. Quality score and visible tech debt tracking are part of the project canon.
6. Parallel worktrees are optional, but their usage pattern is documented before teams need it.

## Consequences

- Agent-written route code becomes more uniform and easier to audit.
- Local debugging stays usable without forcing extra infrastructure.
- Sample drift and obsolete starter assets are less likely to survive unnoticed.
- Review policy becomes more portable across future template-based projects.
- The starter carries a few more docs and scripts, but they reduce long-term entropy.
