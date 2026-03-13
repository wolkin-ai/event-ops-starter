# Harness Engineering Gap Checklist

Reference article:

- [OpenAI: Harness engineering](https://openai.com/index/harness-engineering/)
- [OpenAI: Harness engineering (ja-JP)](https://openai.com/ja-JP/index/harness-engineering/)

## Goal

Use this checklist when starting a new product from this repository.

The purpose is not to copy the article literally. The purpose is to measure whether the new project has enough harness quality for agents to work safely, repeatedly, and with low drift.

## How to use it

1. Create a new repository from this template.
2. Review this checklist before replacing the sample domain.
3. Mark each row as `Adopted`, `Partial`, `Missing`, or `Intentional`.
4. Close the `Missing` items that matter before adding external services or team-specific workflows.

## Checklist

| Area                                      | Why it matters                                                                              | Current starter state                                                                                                                                                                                                                                                                                               | Status  | What to do next                                                                                |
| ----------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------- |
| Repository as system of record            | Agents need one place to read rules, architecture, and process.                             | `AGENTS.md` is the entry, `CLAUDE.md` is the canon, ADRs and process docs hold the details.                                                                                                                                                                                                                         | Adopted | Keep this structure when renaming the product.                                                 |
| Local-first development harness           | Agents are more reliable when the app boots without external systems.                       | SQLite, demo session cookie, Storybook, Vitest, and Playwright run locally without external auth or database servers.                                                                                                                                                                                               | Adopted | Preserve this rule when adding new dependencies.                                               |
| Replaceable boundaries and adapters       | Swappable infrastructure reduces rewrite cost and keeps PoC decisions reversible.           | Ports, composition roots, session gateway, and separate planning/publication models are already in place.                                                                                                                                                                                                           | Adopted | Add every new external dependency through a port and local adapter.                            |
| Boundary validation                       | Agent output becomes safer when inputs and outputs are validated at system edges.           | Route handlers use shared request/response contract helpers, current Prisma/session adapters fail fast at their boundaries, and `npm run boundary:check` enforces same-slice contract modules for future adapters.                                                                                                  | Adopted | Preserve the guard and keep new provider schemas inside infrastructure.                        |
| Agent-visible observability               | Agents work better when they can inspect logs, traces, and runtime behavior directly.       | Structured route logs and request IDs exist, route helpers now emit worktree-local trace and metric samples, and `./bin/worktree-harness inspect/logs/observe` exposes them without requiring hosted infrastructure.                                                                                                | Adopted | Add a richer trace viewer or metrics dashboard only if the local files stop being enough.      |
| Recurring cleanup and doc gardening       | Agent-heavy repos drift quickly unless stale docs and scaffolding are cleaned continuously. | Cleanup checks exist in scripts, and the scheduled GitHub workflow now uploads patch/report artifacts when removable drift is detected instead of only reporting it.                                                                                                                                                | Adopted | Open a PR automatically only when cleanup churn becomes frequent enough to justify it.         |
| Autonomous review loop                    | The harness should review and gate changes with minimal manual routing.                     | CI now routes reviews through a review suite and explicit thresholds, but real Codex execution is still opt-in.                                                                                                                                                                                                     | Partial | Add controlled real review execution when a dedicated worker path exists.                      |
| Parallel agent isolation                  | Multiple agents need isolated workspaces to avoid stepping on each other.                   | `./bin/worktree-harness` now creates worktrees, generates `.env`, installs dependencies, optionally runs `db:prepare`, allocates app and Storybook ports, starts and stops local processes, exposes `inspect/logs`, and `npm run worktree:check` enforces lifecycle plus harness-managed ownership rules in verify. | Adopted | Extend policy only if the team needs to govern manual, non-harness worktrees too.              |
| Quality score and debt tracking           | Teams need a visible map of quality level and known gaps to avoid silent decay.             | Quality score and debt tracker docs are now part of the starter canon.                                                                                                                                                                                                                                              | Adopted | Keep them current as the harness evolves.                                                      |
| Template-safe project kickoff             | A starter should help new products begin cleanly instead of blending with existing repos.   | The template rule, handoff sequence, and repo shape guidance are already documented.                                                                                                                                                                                                                                | Adopted | Keep the starter separate from live product repos unless using a deliberate monorepo boundary. |
| Sample journeys that exercise the harness | A template should include realistic slices that prove the workflow, not only empty folders. | Public registration and admin publication flows are implemented end to end.                                                                                                                                                                                                                                         | Adopted | Replace the sample domain gradually instead of deleting it all at once.                        |
| Project-local skills                      | Skills must travel with the project so behavior does not depend on one developer machine.   | Canonical skills live in `skills/core`, Claude/Codex adapters are generated locally, and review prompts are project-local.                                                                                                                                                                                          | Adopted | Keep aliases and adapters synchronized through the registry.                                   |

## Recommended adoption order

When a new product starts from this template, add the missing harness layers in this order:

1. Keep local-first startup intact.
2. Standardize boundary validation.
3. Add structured logs that agents can inspect locally.
4. Add quality score and debt tracking docs.
5. Add scheduled cleanup.
6. Add background review automation only when the team actually runs multiple agents in parallel.

## Intentional non-goals for this starter

The starter does not try to ship every mature harness feature on day one.

- It does not require a hosted observability stack before product discovery starts.
- It does not enforce ownership for manual worktrees that bypass the harness.
- It does not auto-merge agent work by default.

These are intentional omissions, not oversights. Add them when the product and team throughput justify the extra harness cost.
