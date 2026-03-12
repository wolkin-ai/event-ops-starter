# Parallel Agent Worktrees

## Goal

Let multiple agents work in parallel without sharing one working tree.

## When to use this

Use worktrees only when two or more agents are actively implementing separate slices at the same time.

For normal work, a single repository checkout is simpler.

## Basic rule

- one worktree per active slice
- one branch per worktree
- one agent owns one worktree at a time
- branch names should use the `codex/` prefix when Codex creates them

## CLI workflow

```bash
./bin/worktree-harness create admin-publication
./bin/worktree-harness create ops-cleanup
./bin/worktree-harness start admin-publication app
./bin/worktree-harness start admin-publication storybook
./bin/worktree-harness status admin-publication
./bin/worktree-harness stop admin-publication all
./bin/worktree-harness remove admin-publication --force --delete-branch
```

## What the harness does

- creates a sibling worktree path like `../event-ops-starter-<name>`
- creates a branch named `codex/<name>` unless overridden
- generates `.env` from `.env` or `.env.example`
- runs local `npm install --no-fund --no-audit` in that worktree
- runs `npm run db:prepare` unless `--skip-db-prepare` is passed
- assigns app ports from `3001+` and Storybook ports from `6007+`
- stores shared state and logs under the git common dir at `.git/codex-worktree-harness`

Default host binding is `127.0.0.1`.

Pass `--host` only when the machine already has a bindable loopback alias or another safe local host prepared.

`--link-node-modules` is intentionally opt-in.

Some runtimes reject shared `node_modules` symlinks, and shared installs weaken worktree isolation when dependencies diverge by branch.

## Merge discipline

1. Keep changes scoped to one slice.
2. Run `npm run verify:all` in that worktree before merge.
3. `verify:all` now includes `npm run worktree:check`, so the harness lifecycle itself is exercised in CI-facing local checks.
4. Rebase or merge from `main` before opening the PR if another slice landed first.
5. Remove the worktree after merge:

```bash
./bin/worktree-harness remove admin-publication --force --delete-branch
```

## Non-goal

This playbook does not try to enforce ownership in repo policy or CI yet.

It also does not provide per-worktree traces or metrics yet.
