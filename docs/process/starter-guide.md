# Starter Guide

## Goal

This guide is the fastest way to understand what this repository is, how it is operated, and where each rule lives.

Use this document when:

- you are new to the repository
- you need a map before reading detailed docs
- you want to explain the platform to another person

This file is a guide, not the source of truth. Detailed rules still live in the documents linked below.

## One-sentence summary

This repository is an AI-ready, local-first Next.js starter that includes a public sample product, an admin console, project-local skills, explicit architecture rules, review/verification gates, and playbooks for provider rollout plus parallel worktree ownership.

## What this repository is for

- start a new product from a clean template
- keep AI behavior project-local instead of machine-local
- let teams work locally without external auth or database servers
- make architecture, reviews, and quality gates explicit before product scale

## What this repository is not for

- copying into an already-running product repository
- hiding product-specific decisions inside the starter
- requiring hosted infrastructure before local development works
- forcing every advanced harness feature before PMF

## Where the truth lives

Read these in order when you need the full rules:

1. [AGENTS.md](../../AGENTS.md)
   Entry point only.
2. [CLAUDE.md](../../CLAUDE.md)
   Runtime canon, workflow, verification, guardrails.
3. [docs/adr](../adr)
   Why important design decisions were made.
4. [docs/process](.)
   How to operate the starter day to day.
5. [skills/core](../../skills/core)
   Project-local AI skills.

If two docs disagree, `CLAUDE.md` wins unless an ADR explicitly supersedes it.

## The core model

Think of the starter as five layers.

1. Product sample
   Public event flow and admin operations flow.
2. Architecture
   DDD, ports and adapters, composition roots, route contracts.
3. Local harness
   SQLite, demo session, Storybook, Vitest, Playwright, structured logs.
4. AI harness
   Skills, review wrappers, workflow rules, review policies.
5. Governance
   ADRs, quality score, debt tracker, cleanup checks, CI.

## Reading paths by goal

### I need a 10-minute overview

Read in this order:

1. [README.md](../../README.md)
2. [CLAUDE.md](../../CLAUDE.md)
3. [docs/process/starting-a-new-project.md](./starting-a-new-project.md)
4. [docs/process/quality-score.md](./quality-score.md)

### I want to start a new project from this template

Read in this order:

1. [docs/process/starting-a-new-project.md](./starting-a-new-project.md)
2. [docs/process/harness-engineering-gap-checklist.md](./harness-engineering-gap-checklist.md)
3. [docs/process/team-starter-kit.md](./team-starter-kit.md)
4. [README.md](../../README.md)

### I want to work safely day to day

Read in this order:

1. [CLAUDE.md](../../CLAUDE.md)
2. [docs/process/harness-implementation-checklist.md](./harness-implementation-checklist.md)
3. [docs/process/boundary-validation.md](./boundary-validation.md)
4. [docs/process/local-observability.md](./local-observability.md)
5. [docs/process/skill-matrix.md](./skill-matrix.md)

### I want to add a hosted provider or deployment later

Read in this order:

1. [docs/process/infrastructure-continuity.md](./infrastructure-continuity.md)
2. [docs/process/local-provider-checks.md](./local-provider-checks.md)
3. [docs/process/harness-implementation-checklist.md](./harness-implementation-checklist.md)
4. [docs/process/local-observability.md](./local-observability.md)

Starter commands:

- `npm run check:observability`
- `npm run check:preview -- --base-url http://127.0.0.1:3000`

### I want to maintain the platform itself

Read in this order:

1. [docs/process/quality-score.md](./quality-score.md)
2. [docs/process/tech-debt-tracker.md](./tech-debt-tracker.md)
3. [docs/process/parallel-agent-worktrees.md](./parallel-agent-worktrees.md)
4. [docs/adr/ADR-007-harness-maturity-defaults.md](../adr/ADR-007-harness-maturity-defaults.md)

## Rule categories

### Product rules

- public flow and admin flow exist as sample slices
- `EventPlan` and `EventPublication` are intentionally separate
- publication lifecycle is explicit

Primary docs:

- [README.md](../../README.md)
- [docs/adr/ADR-006-explicit-publication-lifecycle.md](../adr/ADR-006-explicit-publication-lifecycle.md)

### Architecture rules

- dependency direction is fixed
- domain and application stay away from Prisma details
- replaceable boundaries matter more than prototype shortcuts

Primary docs:

- [CLAUDE.md](../../CLAUDE.md)
- [docs/adr/ADR-003-architecture.md](../adr/ADR-003-architecture.md)
- [docs/adr/ADR-005-local-first-replaceable-boundaries.md](../adr/ADR-005-local-first-replaceable-boundaries.md)

### Workflow rules

- story draft before implementation
- language gate before domain naming settles
- verify before considering a change done

Primary docs:

- [CLAUDE.md](../../CLAUDE.md)
- [docs/adr/ADR-002-ai-workflow.md](../adr/ADR-002-ai-workflow.md)
- [skills/core/safe-change-flow/SKILL.md](../../skills/core/safe-change-flow/SKILL.md)

### Harness rules

- validation at route boundaries
- local structured logging
- infrastructure continuity once hosted services exist
- local provider checks before browser or preview debugging
- task manifests for parallel worktrees
- cleanup checks
  local `npm run cleanup:check` stays report-only, while the scheduled `Harness Maintenance`
  workflow uploads a suggested cleanup patch/report artifact when removable tracked
  artifacts drift back in. Missing required docs still require manual edits.
- review suite policies

Primary docs:

- [docs/process/boundary-validation.md](./boundary-validation.md)
- [docs/process/infrastructure-continuity.md](./infrastructure-continuity.md)
- [docs/process/local-provider-checks.md](./local-provider-checks.md)
- [docs/process/local-observability.md](./local-observability.md)
- [docs/process/parallel-agent-worktrees.md](./parallel-agent-worktrees.md)
- [docs/adr/ADR-007-harness-maturity-defaults.md](../adr/ADR-007-harness-maturity-defaults.md)

### Governance rules

- visible quality score
- explicit debt tracker
- template-safe kickoff guidance

Primary docs:

- [docs/process/quality-score.md](./quality-score.md)
- [docs/process/tech-debt-tracker.md](./tech-debt-tracker.md)
- [docs/process/starting-a-new-project.md](./starting-a-new-project.md)

## Typical questions and where to answer them

| Question                                  | First document to open                                                                    |
| ----------------------------------------- | ----------------------------------------------------------------------------------------- |
| What is this repo for?                    | [README.md](../../README.md)                                                              |
| Which rule wins?                          | [CLAUDE.md](../../CLAUDE.md)                                                              |
| How do I start a new product from this?   | [docs/process/starting-a-new-project.md](./starting-a-new-project.md)                     |
| What is still incomplete in the harness?  | [docs/process/tech-debt-tracker.md](./tech-debt-tracker.md)                               |
| How mature is the harness right now?      | [docs/process/quality-score.md](./quality-score.md)                                       |
| How do I add a hosted provider safely?    | [docs/process/local-provider-checks.md](./local-provider-checks.md)                       |
| How do I preserve hosted infra choices?   | [docs/process/infrastructure-continuity.md](./infrastructure-continuity.md)               |
| How do route contracts work?              | [docs/process/boundary-validation.md](./boundary-validation.md)                           |
| What should I check while implementing?   | [docs/process/harness-implementation-checklist.md](./harness-implementation-checklist.md) |
| How do I guide someone through the repo?  | [docs/process/team-starter-kit.md](./team-starter-kit.md)                                 |
| How do parallel agents declare ownership? | [docs/process/parallel-agent-worktrees.md](./parallel-agent-worktrees.md)                 |
| Which skill should be used?               | [docs/process/skill-matrix.md](./skill-matrix.md)                                         |

## The minimum mental model

If you remember only five things, remember these:

1. `CLAUDE.md` is the canon.
2. New products start from a fresh repo, not by mixing into an old repo.
3. Local development must work without external servers.
4. Architecture boundaries are intentional and should stay replaceable.
5. Quality and debt must stay visible instead of living in memory.
