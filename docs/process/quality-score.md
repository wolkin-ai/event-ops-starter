# Quality Score

## Scale

- `0` Missing
- `1` Documented only
- `2` Implemented partially
- `3` Implemented and enforced

## Current score

| Capability               | Score | Notes                                                                                                                                                                                                                                                                                                                                |
| ------------------------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Repository canon         | 3     | `AGENTS.md`, `CLAUDE.md`, ADRs, and process docs are aligned.                                                                                                                                                                                                                                                                        |
| Local-first startup      | 3     | SQLite and demo session keep setup self-contained.                                                                                                                                                                                                                                                                                   |
| Replaceable boundaries   | 3     | Ports, adapters, composition roots, and session gateway are in place.                                                                                                                                                                                                                                                                |
| Boundary validation      | 3     | Route contracts are standardized, the current Prisma/session adapters fail fast at their boundaries, and `npm run boundary:check` now enforces same-slice contract modules for future adapters.                                                                                                                                      |
| Local observability      | 2     | Structured logs and request IDs exist, but no local traces or metrics backend yet.                                                                                                                                                                                                                                                   |
| Review automation        | 2     | CI review suite and report thresholds exist, but direct Codex execution remains opt-in.                                                                                                                                                                                                                                              |
| Cleanup discipline       | 2     | Cleanup checks and a scheduled maintenance workflow exist, but they do not open fixes automatically.                                                                                                                                                                                                                                 |
| Parallel agent isolation | 2     | `./bin/worktree-harness` scripts create/start/stop/remove/list/status, allocates branch/path/ports, bootstraps `.env` and dependencies, and keeps shared state/logs under the git common dir. `npm run worktree:check` now exercises the lifecycle in verify, but ownership remains a documented team rule instead of a repo policy. |
| Quality/debt tracking    | 3     | Quality score and debt tracker are now part of the starter canon.                                                                                                                                                                                                                                                                    |
| Template-safe kickoff    | 3     | New-project guidance keeps the starter separate from live product repos.                                                                                                                                                                                                                                                             |

## Summary

- Total: `26 / 30`
- Grade: `B`

## Interpretation

This starter is strong enough for early product work and safe agent collaboration.

The next maturity jump comes from:

1. richer local observability
2. automated cleanup and review follow-up
3. stronger parallel-agent ownership enforcement
