# Tech Debt Tracker

## Current debt items

| ID     | Area                            | Status | Priority | Exit condition                                                                                                        |
| ------ | ------------------------------- | ------ | -------- | --------------------------------------------------------------------------------------------------------------------- |
| HD-002 | Local traces and metrics        | Open   | Medium   | The repo provides an optional local trace or metrics harness without requiring hosted infrastructure.                 |
| HD-003 | Cleanup automation              | Open   | Medium   | Scheduled maintenance can open or prepare a fix instead of only reporting drift.                                      |
| HD-005 | CI review execution             | Open   | Medium   | Specialist reviews can run with real Codex execution in a controlled CI or dedicated review worker.                   |
| HD-007 | Parallel agent ownership policy | Open   | Medium   | Repo policy or CI guidance makes concurrent agents use separate worktrees instead of relying only on team discipline. |

## Recently closed

| ID     | Area                                   | Closed by                                                                                                               |
| ------ | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| HD-006 | Parallel agent enforcement             | `npm run worktree:check` now runs a temporary-repo acceptance flow for `./bin/worktree-harness` inside `verify:all`.    |
| HD-004 | Parallel agent tooling                 | `./bin/worktree-harness` now bootstraps worktree create/start/stop/remove flows instead of relying on manual docs only. |
| HD-001 | Boundary validation policy enforcement | `npm run boundary:check` now blocks adapter implementations that skip same-slice contract modules.                      |

## Rule

Do not hide these items in ad hoc notes. If a new project inherits this starter, copy this file and either close the item explicitly or keep it visible with a clear reason.
