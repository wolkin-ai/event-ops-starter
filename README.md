# Event Ops Starter

Event Ops Starter is a standalone Next.js starter for teams that need both a public event journey and an operations-grade admin interface.

## What is included

- Public landing, event list, event detail, registration flow, attendee dashboard
- Admin dashboard, event list, attendee list, event create flow, explicit publish/withdraw controls, publication copy editor
- DDD/Clean Architecture skeleton with composition roots
- Signed demo session boundary for `attendee` and `admin`
- Prisma 7 + SQLite starter wiring with a generated local client
- `admin plan` と `public publication` を分けたローカル完結モデル
- Storybook, Vitest, Playwright, dependency-cruiser
- Project-local skills and Codex review wrappers
- Structured API logs, request IDs, cleanup checks, and review suite policies

## Quick start

```bash
npm install
npm run db:prepare
npm run skills:sync
npm run verify:all
```

外部サーバーは不要です。SQLite ファイルと demo session cookie だけで、ローカルで公開画面・管理画面・E2E まで確認できます。

Open `/login` to create a demo attendee or admin session before entering protected routes.

## Use this as a template

The intended operating model is:

1. Create a brand-new repository from this template.
2. Clone that new repository into a fresh folder.
3. Rename package, product copy, and bounded contexts for the new product.
4. Keep the platform rules, skills, review wrappers, and verification gates intact.

Do not copy this starter into an existing product repository. Mixing sample code with an already-running codebase weakens the architecture rules and makes replacement boundaries unclear.

If a future product needs a monorepo, start with this starter inside `apps/web` from day one instead of moving files later.

See [docs/process/starting-a-new-project.md](./docs/process/starting-a-new-project.md) for the concrete handoff sequence.
Use [docs/process/harness-engineering-gap-checklist.md](./docs/process/harness-engineering-gap-checklist.md) to evaluate what should be added before a new product scales beyond the sample harness.

## Key commands

```bash
npm run db:prepare
npm run db:reset-local
npm run db:seed
npm run storybook
npm run test
npm run test-storybook
npm run test:e2e
npm run cleanup:check
npm run review:suite
npm run review:architecture -- src
```

`review:*` writes project-local reports immediately. Use `CODEX_REVIEW_EXEC=1` to turn on direct Codex execution.

`db:prepare` is the safe default and does not reset local data. If the Prisma schema changes incompatibly in local development, run `npm run db:reset-local` explicitly.

## Environment

```bash
cp .env.example .env
```

- `DATABASE_URL` defaults to `file:./dev.db`
- `SESSION_SECRET` signs the demo session cookie
- `LOG_LEVEL` controls structured local logging (`info` by default, `debug` when inspecting route behavior)

## Local-first rules

- adapters は runtime seed を持たない
- admin planning と public publication は別 persistence model
- EventPlan の作成は EventPublication を自動生成しない
- publish / withdraw は明示的な admin use case でのみ行う
- market-facing copy は EventPublication 側で編集し、EventPlan に逆流させない
- 認証は session feature 経由で扱い、page や route が cookie 実装に固定されない
- 新しい外部依存を足すときは、local adapter か emulator 方針を同時に用意する
- route handler の request/response は共通 boundary helper を通して検証する
- API error payload は `code` と `requestId` を持つ

## Structure

```text
src/
  app/                  # Next.js routes
  components/           # Public and admin UI
  composition/          # Wiring from use cases to adapters
  features/             # Domain, application, infrastructure
  generated/prisma/     # Prisma 7 generated client
skills/core/            # Canonical project-local skills
.claude/skills/         # Generated Claude adapters
docs/codex-agents/      # Codex specialist prompts
```

## Recommended start patterns

Default:

```text
new-product/
  .github/
  .storybook/
  docs/
  prisma/
  skills/
  src/
  tests/
```

If you know the product will become a monorepo:

```text
new-product/
  apps/
    web/
  packages/
    config/
    ui/
  docs/
```

Use the current repository as a standalone template by default. Move to the monorepo pattern only when multiple deployable apps or shared internal packages are already expected.

## Harness maturity docs

- [Boundary validation](./docs/process/boundary-validation.md)
- [Local observability](./docs/process/local-observability.md)
- [Quality score](./docs/process/quality-score.md)
- [Tech debt tracker](./docs/process/tech-debt-tracker.md)
- [Parallel agent worktrees](./docs/process/parallel-agent-worktrees.md)
