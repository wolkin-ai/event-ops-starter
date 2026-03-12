# Team Starter Kit

## Goal

This is the document to hand to another person when they need to start, understand, and use the starter without reading everything first.

## Who this is for

- product engineers joining the project
- designers or PMs who need the operating model
- another team starting a new product from this starter

## What you need to know first

- this repository is a template-backed starter, not a live product
- the event domain is sample content
- the architecture, workflow, and harness rules are the reusable part

## First-day checklist

1. Read [README.md](../../README.md).
2. Read [docs/process/starter-guide.md](./starter-guide.md).
3. Read [CLAUDE.md](../../CLAUDE.md).
4. Run:

```bash
cp .env.example .env
npm install
npm run db:prepare
npm run verify:all
```

5. Open:
   - app: `http://localhost:3000`
   - Storybook: `http://localhost:6006`

## How to explain the repo in one minute

Say this:

> This is a local-first starter for AI-assisted product development. It ships a sample public product flow, a sample admin flow, project-local skills, review scripts, and explicit rules for architecture, validation, and verification.

## What to keep when starting a new product

- `CLAUDE.md`
- `docs/adr`
- `docs/process`
- `skills/core`
- `.claude/skills`
- `.agents/skills`
- `bin`
- `scripts`
- `.storybook`
- verification commands
- review commands

## What to replace when starting a new product

- package name
- product copy
- sample domain language that does not match the real business
- sample seed data
- sample UI branding

## Standard operating flows

### Flow A: understand the starter

1. Read [docs/process/starter-guide.md](./starter-guide.md).
2. Read [docs/process/quality-score.md](./quality-score.md).
3. Read [docs/process/tech-debt-tracker.md](./tech-debt-tracker.md).

### Flow B: start a new project from the starter

1. Follow [docs/process/starting-a-new-project.md](./starting-a-new-project.md).
2. Review [docs/process/harness-engineering-gap-checklist.md](./harness-engineering-gap-checklist.md).
3. Keep the rules and replace the sample domain gradually.

### Flow C: make a safe change

1. Use [skills/core/safe-change-flow/SKILL.md](../../skills/core/safe-change-flow/SKILL.md).
2. If the change touches naming, also use [skills/core/define-domain-language/SKILL.md](../../skills/core/define-domain-language/SKILL.md).
3. Run `npm run verify:all`.
4. Run `npm run review:suite`.

### Flow D: explain the rules to another person

1. Start with [docs/process/starter-guide.md](./starter-guide.md).
2. Show [CLAUDE.md](../../CLAUDE.md) as the canon.
3. Use [docs/process/skill-matrix.md](./skill-matrix.md) to explain what each skill is for.

## Common commands

```bash
npm run db:prepare
npm run verify:all
npm run review:suite
npm run cleanup:check
npm run storybook
```

## Where to look when something is unclear

| Need               | Open this first                                                           |
| ------------------ | ------------------------------------------------------------------------- |
| Full runtime rules | [CLAUDE.md](../../CLAUDE.md)                                              |
| Project kickoff    | [docs/process/starting-a-new-project.md](./starting-a-new-project.md)     |
| Validation rules   | [docs/process/boundary-validation.md](./boundary-validation.md)           |
| Local debugging    | [docs/process/local-observability.md](./local-observability.md)           |
| Current maturity   | [docs/process/quality-score.md](./quality-score.md)                       |
| Known gaps         | [docs/process/tech-debt-tracker.md](./tech-debt-tracker.md)               |
| Worktree usage     | [docs/process/parallel-agent-worktrees.md](./parallel-agent-worktrees.md) |
| Skills             | [docs/process/skill-matrix.md](./skill-matrix.md)                         |

## Handoff note for new teams

Do not try to memorize everything at once.

Use this order:

1. understand the map
2. run the repo locally
3. change one small thing safely
4. only then read the deeper docs

That is the intended learning path.
