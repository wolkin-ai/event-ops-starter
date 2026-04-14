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
- one task manifest per active slice
- branch names should use the `codex/` prefix when Codex creates them

## CLI workflow

```bash
./bin/worktree-harness create admin-publication
./bin/worktree-harness create ops-cleanup
./bin/worktree-harness start admin-publication app
./bin/worktree-harness start admin-publication storybook
./bin/worktree-harness status admin-publication
./bin/worktree-harness observe admin-publication metrics
./bin/worktree-harness stop admin-publication all
./bin/worktree-harness remove admin-publication --force --delete-branch
```

## What the harness does

- creates a sibling worktree path like `../event-ops-starter-<name>`
- creates a branch named `codex/<name>` unless overridden
- generates `.env` from `.env` or `.env.example`
- seeds `docs/temp/worktrees/<name>.md` from `docs/templates/WORKTREE_TASK_MANIFEST.md` when the template exists
- runs local `npm install --no-fund --no-audit` in that worktree
- runs `npm run db:prepare` unless `--skip-db-prepare` is passed
- assigns app ports from `3001+` and Storybook ports from `6007+`
- stores shared state and logs under the git common dir at `.git/codex-worktree-harness`
- stores worktree-local trace and metric samples under the same shared harness directory

Default host binding is `127.0.0.1`.

Pass `--host` only when the machine already has a bindable loopback alias or another safe local host prepared.

`--link-node-modules` is intentionally opt-in.

Some runtimes reject shared `node_modules` symlinks, and shared installs weaken worktree isolation when dependencies diverge by branch.

## Task manifest discipline

Each harness-managed worktree should keep a task manifest at `docs/temp/worktrees/<name>.md`.

Use [docs/templates/WORKTREE_TASK_MANIFEST.md](../templates/WORKTREE_TASK_MANIFEST.md) as the coordination template. The initial file is created automatically by `./bin/worktree-harness create <name>` when the template exists.

Fill these fields before editing shared files or asking another agent to continue:

- `goal`
- `scope`
- `owned paths`
- `do not touch`
- `acceptance criteria`
- `verification`
- `integration notes`

Treat the manifest as the coordination contract, not as optional notes.

## Shared files default to serial

Keep these paths out of parallel slices unless the task is explicitly coordinated as serial work:

- `package.json`
- `package-lock.json`
- `prisma/schema.prisma`
- `CLAUDE.md`
- `docs/process/domain-glossary.md`
- `skills/core/**`

## Minimum repo policy

`npm run worktree:policy` checks only harness-managed worktrees recorded in `.git/codex-worktree-harness/state.json`.

Task manifest discipline is still review-time coordination. The current policy does not parse or validate manifest contents yet.

It fails when:

- a managed worktree points at the canonical root path or canonical root branch
- a managed worktree path is missing from `git worktree list --porcelain`
- a managed worktree branch in harness metadata does not match the branch attached to that worktree path
- two managed worktrees reuse the same branch
- two managed worktrees reuse the same path
- two managed worktrees reuse the same runtime endpoint (`host + port`) across app or Storybook

This scope is intentionally narrow for now.

Manual `git worktree add` usage that is not recorded by the harness is still out of scope.

## Merge discipline

1. Keep changes scoped to one slice and keep the task manifest current.
2. Run `npm run verify:all` in that worktree before merge.
3. `verify:all` now includes `npm run worktree:check`, which runs both the ownership policy check and the harness lifecycle acceptance flow.
4. Rebase or merge from `main` before opening the PR if another slice landed first.
5. Remove the worktree after merge:

```bash
./bin/worktree-harness remove admin-publication --force --delete-branch
```

## Non-goal

This playbook does not try to enforce full ownership policy yet.

It only checks harness metadata against git worktree state.

It also does not provide a full trace viewer or metrics dashboard yet.
