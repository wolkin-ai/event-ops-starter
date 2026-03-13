# Tech Debt Tracker

## Current debt items

| ID     | Area                | Status | Priority | Exit condition                                                                                      |
| ------ | ------------------- | ------ | -------- | --------------------------------------------------------------------------------------------------- |
| HD-005 | CI review execution | Open   | Medium   | Specialist reviews can run with real Codex execution in a controlled CI or dedicated review worker. |

## Recently closed

| ID     | Area                                   | Closed by                                                                                                                    |
| ------ | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| HD-002 | Local traces and metrics               | Route helpers now emit worktree-local trace and metric samples, and `./bin/worktree-harness observe` exposes them locally.   |
| HD-007 | Parallel agent ownership policy        | `npm run worktree:policy` now checks harness-managed branch/path/runtime ownership and runs inside `npm run worktree:check`. |
| HD-003 | Cleanup automation                     | The scheduled maintenance workflow now prepares cleanup patch/report artifacts instead of only reporting drift.              |
| HD-006 | Parallel agent enforcement             | `npm run worktree:check` now runs a temporary-repo acceptance flow for `./bin/worktree-harness` inside `verify:all`.         |
| HD-004 | Parallel agent tooling                 | `./bin/worktree-harness` now bootstraps worktree create/start/stop/remove flows instead of relying on manual docs only.      |
| HD-001 | Boundary validation policy enforcement | `npm run boundary:check` now blocks adapter implementations that skip same-slice contract modules.                           |

## Rule

Do not hide these items in ad hoc notes. If a new project inherits this starter, copy this file and either close the item explicitly or keep it visible with a clear reason.
