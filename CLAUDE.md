# Event Ops Starter Canon

## Purpose

This repository is a standalone, AI-ready starter for a public event experience and an admin operations console.

It is also intended to work as a template repository for future projects. New products should start from a fresh repository created from this starter, not by copying files into an existing product repository.

Before evolving the sample into a real product, review `docs/process/harness-engineering-gap-checklist.md` and explicitly decide which missing harness layers must be adopted.

When someone needs a reading map or onboarding path, start from `docs/process/starter-guide.md` and `docs/process/team-starter-kit.md`.

For any code, config, UI, Storybook, adapter, or workflow change, open `docs/process/harness-implementation-checklist.md` first and use it again before commit as the required preflight and closeout checklist.

When a derived product later adopts hosted providers or deployment targets, read `docs/process/infrastructure-continuity.md` and `docs/process/local-provider-checks.md` before making the hosted path required.

## Roles

- Codex owns domain language, application logic, review strategy, and specialist reviews.
- Claude Code owns Storybook drafts, public UI, admin UI, and story maintenance.
- `skills/core` is the source of truth for reusable skills.
- `.claude/skills` and `.agents/skills` are adapter layers generated from project-local skills.

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

1. Implementation checklist preflight
2. Story draft
3. L1 language gate
4. Contract card update
5. Domain/use case tests
6. Implementation
7. Boundary validation and route contract check
8. Storybook review
9. Codex specialist review

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
npm run cleanup:check
npm run boundary:check
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
- Codex adapters are generated into `.agents/skills`.
- Alias names are allowed only through the project registry.
- Do not bypass project-local review scripts or route-contract helpers when equivalent project rules already exist.

## Auth And Data

- Protected routes use Auth.js JWT sessions for `attendee` and `admin`.
- `/dashboard` requires `attendee` or `admin`, `/admin/**` requires `admin`.
- Prisma 7 is configured through `prisma.config.ts`.
- Generated Prisma client lives under `src/generated/prisma`.
- Local development stays repo-local through Docker Compose PostgreSQL plus Auth.js demo role login.
- Seed data is executed only through `db:seed` / `db:prepare`, never from adapters at runtime.
- Resetting local data must stay explicit. Do not hide destructive reset behavior inside `db:prepare` or CI paths.
- Public catalog and admin planning use separate persistence models and may evolve independently.
- Creating an `EventPlan` must not auto-create an `EventPublication`.
- Registrations and public routes depend on live publication state, not on plan existence alone.
- Market-facing copy belongs to `EventPublication` and must not mutate `EventPlan` fields implicitly.

## Boundary Validation

- Route handlers must validate request JSON through shared helpers.
- Route handlers must validate success payloads before returning them.
- Error payloads must include `code` and `requestId`.
- Expected failures must be mapped once at the route boundary to stable HTTP `status` and `code`.
- Unexpected failures must return a generic fallback response and keep internal detail in logs.
- New external adapters must validate provider-facing input and output at the infrastructure boundary.
- External adapter implementations must go through a same-slice `*-contract.ts` module instead of importing `zod` or `@/lib/event-records` directly.

## Local Observability

- Local inspection starts with structured logs and `requestId`, not with an external logging backend.
- Use `LOG_LEVEL=debug` only when inspecting runtime behavior locally.
- Keep local observability self-contained. Do not require hosted metrics, tracing, or log infrastructure to boot the app.

## Infrastructure Continuity

- This starter stays local-first by default, but derived products may later adopt hosted auth, storage, queues, or deployment targets.
- Once a product has a connected hosted provider or deployment account, preserve that resource identity and its environment contract by default.
- Renaming or dropping established env vars counts as an infrastructure change and requires a migration plan.
- New external providers should ship with a repo-local `check:<provider>` command and documented expected failures before browser, E2E, or preview verification depends on them.

## Guardrails

- Do not skip `docs/process/harness-implementation-checklist.md` for code, config, UI, Storybook, adapter, or workflow changes.
- UI changes must keep Storybook as a review surface with explicit states and at least one `play` interaction when the component is interactive.
- Domain/application changes must start from invariants and use case tests before wiring adapters.
- Do not let domain/application code construct HTTP error payloads or depend on route transport details.
- Do not scatter ad hoc route error handling when `RouteContractError`, `errorResponse`, or `handleRouteError` already fits.
- Do not reintroduce runtime seed calls inside repository adapters.
- Do not let `app/` or `components/` depend on session infrastructure directly.
- Publish / withdraw changes must go through explicit application use cases and contract cards.
- Publication copy edits must stay on the publication editor path instead of reusing plan-creation forms.
- New external services must ship with either a local adapter or an emulator story before becoming required for development.
- When multiple agents work in parallel, use `./bin/worktree-harness` together with a task manifest under `docs/temp/worktrees/<task-id>.md`, and keep `owned paths` / `do not touch` explicit.
- For hosted auth / storage / deployment changes, read `docs/process/infrastructure-continuity.md` first and preserve established env names unless a migration plan is explicit.
- When a new external provider becomes required, update `docs/process/local-provider-checks.md` and add the smallest useful local provider check before wiring preview or browser flows.
- When starting a new product, preserve `docs/`, `skills/`, `bin/`, verification scripts, and review wrappers before replacing sample domains or UI copy.
- Do not blend this starter into an existing repository unless you intentionally adopt a monorepo layout with `apps/web` as the boundary.
- Keep `docs/process/quality-score.md` and `docs/process/tech-debt-tracker.md` current when harness maturity changes.
- Do not reintroduce tracked sample assets or generated review artifacts into the repository.

## Review Commands

```bash
./bin/codex-review architecture src
./bin/codex-review security src
./bin/codex-review performance src
./bin/codex-review investigate src
npm run review:suite
```

Set `CODEX_REVIEW_EXEC=1` only when you want the wrapper to call the Codex agent directly.
