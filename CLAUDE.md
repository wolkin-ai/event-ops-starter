# Event Ops Starter Canon

## Purpose

This repository is a standalone, AI-ready starter for a public event experience and an admin operations console.

It is also intended to work as a template repository for future projects. New products should start from a fresh repository created from this starter, not by copying files into an existing product repository.

Before evolving the sample into a real product, review `docs/process/harness-engineering-gap-checklist.md` and explicitly decide which missing harness layers must be adopted.

## Roles

- Codex owns domain language, application logic, review strategy, and specialist reviews.
- Claude Code owns Storybook drafts, public UI, admin UI, and story maintenance.
- `skills/core` is the source of truth for reusable skills.
- `.claude/skills` is an adapter layer generated from project-local skills.

## Architecture

Dependency direction is fixed:

```text
Domain <- Application <- Infrastructure <- Interface/UI
```

React work is split into:

- UI: pure presentational components
- Logic: hooks and local state transitions
- I/O: adapters, route handlers, external clients

## Contexts

- `catalog` - public publication
- `registration`
- `admin-events` - operator planning
- `session`

## Workflow

1. Story draft
2. L1 language gate
3. Contract card update
4. Domain/use case tests
5. Implementation
6. Storybook review
7. Codex specialist review

## Verification

Default gate:

```bash
npm run verify:all
```

When debugging individual steps, run in this order:

```bash
npm run format:check
npm run db:prepare
npm run lint
npm run skills:validate
npm run arch:check
npm run typecheck
npm run test
npm run build
npm run build-storybook
npm run test-storybook
npm run test:e2e
```

Use `npm run db:reset-local` only when local Prisma state is no longer compatible.

## Skill Policy

- Do not depend on `~/.agents/skills` or `~/.codex/skills`.
- Canonical skills live in `skills/core/<skill-name>/SKILL.md`.
- Claude adapters are generated into `.claude/skills`.
- Alias names are allowed only through the project registry.

## Auth And Data

- Protected routes use a signed demo session cookie for `attendee` and `admin`.
- `/dashboard` requires `attendee` or `admin`, `/admin/**` requires `admin`.
- Prisma 7 is configured through `prisma.config.ts`.
- Generated Prisma client lives under `src/generated/prisma`.
- Local development must stay self-contained: SQLite file + demo session, no external auth or database server required.
- Seed data is executed only through `db:seed` / `db:prepare`, never from adapters at runtime.
- Resetting local data must stay explicit. Do not hide `--force-reset` inside `db:prepare` or CI paths.
- Public catalog and admin planning use separate persistence models and may evolve independently.
- Creating an `EventPlan` must not auto-create an `EventPublication`.
- Registrations and public routes depend on live publication state, not on plan existence alone.
- Market-facing copy belongs to `EventPublication` and must not mutate `EventPlan` fields implicitly.

## Guardrails

- Do not reintroduce runtime seed calls inside repository adapters.
- Do not let `app/` or `components/` depend on session infrastructure directly.
- Publish / withdraw changes must go through explicit application use cases and contract cards.
- Publication copy edits must stay on the publication editor path instead of reusing plan-creation forms.
- New external services must ship with either a local adapter or an emulator story before becoming required for development.
- When starting a new product, preserve `docs/`, `skills/`, `bin/`, verification scripts, and review wrappers before replacing sample domains or UI copy.
- Do not blend this starter into an existing repository unless you intentionally adopt a monorepo layout with `apps/web` as the boundary.

## Review Commands

```bash
./bin/codex-review architecture src
./bin/codex-review security src
./bin/codex-review performance src
./bin/codex-review investigate src
```

Set `CODEX_REVIEW_EXEC=1` only when you want the wrapper to call the Codex agent directly.
