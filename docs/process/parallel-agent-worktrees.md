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

## Example

```bash
git worktree add ../event-ops-starter-admin -b codex/admin-publication
git worktree add ../event-ops-starter-ops -b codex/ops-cleanup
```

## Local setup per worktree

- run `npm install`
- run `npm run db:prepare`
- use a different app port if two worktrees run at once
- keep `.env` local to that worktree

Suggested port split:

- worktree A: app `3000`, Storybook `6006`
- worktree B: app `3001`, Storybook `6007`

Because each worktree has its own folder, each one also gets its own local SQLite file.

## Merge discipline

1. Keep changes scoped to one slice.
2. Run `npm run verify:all` in that worktree before merge.
3. Rebase or merge from `main` before opening the PR if another slice landed first.
4. Remove the worktree after merge:

```bash
git worktree remove ../event-ops-starter-admin
```

## Non-goal

This playbook does not try to automate worktree orchestration yet. It only prevents agents from sharing one mutable checkout.
