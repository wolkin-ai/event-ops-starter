# Starting A New Project

## Goal

Use this repository as a sample-backed starter without mixing it into an existing product folder.

## Default rule

Create a brand-new repository from this starter and clone it into a fresh directory.

Do not copy these files into an already-running repository. That path usually breaks rule ownership, hides sample-specific code, and makes adapter boundaries ambiguous.

## Recommended sequence

1. Create a new repository from this template repository.
2. Clone it into a fresh folder.
3. Review `docs/process/harness-engineering-gap-checklist.md` and mark the gaps that matter for the new product.
4. Decide whether the first real milestone stays local-first or adopts hosted providers early. If hosted providers are involved, read `docs/process/infrastructure-continuity.md` and `docs/process/local-provider-checks.md` before wiring them in.
5. Copy the current `quality-score` and `tech-debt-tracker` files so the new product starts with an explicit baseline.
6. Rename the package, app name, product copy, and domain glossary.
7. Keep `CLAUDE.md`, `docs/adr`, `docs/process`, `docs/templates`, `skills/core`, `bin`, `scripts`, `.storybook`, and verification commands.
8. Replace sample bounded contexts one by one instead of rewriting the whole tree at once.
9. Add new ports only when the product boundary is clear and documented.

## What to keep

- AI workflow and review rules
- Verification gates
- Local-first development policy
- Infrastructure continuity and provider-check playbooks
- Skill registry and adapters
- Composition-root pattern
- Storybook and test harness

## What to replace early

- Product name and README intro
- Public marketing copy
- Sample event domain language when it does not match the new business
- Seed data and demo credentials text

## Repository shapes

### Standalone product

```text
repo-root/
  docs/
  prisma/
  skills/
  src/
  tests/
```

Use this by default.

### Monorepo

```text
repo-root/
  apps/
    web/
  packages/
    config/
    ui/
  docs/
```

Choose this only when multiple deployable apps or shared internal packages are expected from the start.
