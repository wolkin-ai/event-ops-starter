# Quality Score

## Scale

- `0` Missing
- `1` Documented only
- `2` Implemented partially
- `3` Implemented and enforced

## Current score

| Capability               | Score | Notes                                                                                                                                                                                                                                       |
| ------------------------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository canon         | 3     | `AGENTS.md`, `CLAUDE.md`, ADRs, and process docs are aligned.                                                                                                                                                                               |
| Local-first startup      | 3     | SQLite and demo session keep setup self-contained.                                                                                                                                                                                          |
| Replaceable boundaries   | 3     | Ports, adapters, composition roots, and session gateway are in place.                                                                                                                                                                       |
| Boundary validation      | 3     | Route contracts are standardized, the current Prisma/session adapters fail fast at their boundaries, and `npm run boundary:check` now enforces same-slice contract modules for future adapters.                                             |
| Local observability      | 2     | Structured logs and request IDs exist, and `./bin/worktree-harness inspect/logs` now expose worktree-local process snapshots and recent logs. A local trace or metrics backend still does not exist.                                        |
| Review automation        | 2     | CI review suite and report thresholds exist, but direct Codex execution remains opt-in.                                                                                                                                                     |
| Cleanup discipline       | 3     | Cleanup drift is checked in repo gates, and the scheduled maintenance workflow now prepares patch/report artifacts when removable drift is found instead of only reporting it.                                                              |
| Parallel agent isolation | 3     | `./bin/worktree-harness` scripts create/start/stop/remove/list/status/inspect/logs, `npm run worktree:check` exercises the lifecycle in verify, and `npm run worktree:policy` enforces harness-managed branch/path/runtime ownership rules. |
| Quality/debt tracking    | 3     | Quality score and debt tracker are now part of the starter canon.                                                                                                                                                                           |
| Template-safe kickoff    | 3     | New-project guidance keeps the starter separate from live product repos.                                                                                                                                                                    |

## Summary

- Total: `28 / 30`
- Grade: `A-`

## Interpretation

This starter is strong enough for early product work and safe agent collaboration.

The next maturity jump comes from:

1. richer local observability
2. controlled real review execution
