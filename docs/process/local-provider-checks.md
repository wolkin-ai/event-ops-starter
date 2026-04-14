# Local Provider Checks

## Goal

When a derived product introduces a hosted provider, make that provider testable from a local CLI command before browser, Storybook, E2E, preview, or production debugging depends on it.

The starter itself does not ship provider-specific checks by default because the sample runtime is local-first.

It does ship generic rollout helpers so derived products can start from a consistent shape:

```bash
npm run check:observability
npm run check:preview -- --base-url http://127.0.0.1:3000
```

Machine-readable output is also available:

```bash
npm run check:preview -- --base-url http://127.0.0.1:3000 --json
```

## Repo-local config seam

The generic harness lives under `scripts/check/lib/`.

Derived products should keep repo-specific assumptions under `scripts/check/config/`:

- `scripts/check/config/observability.config.mjs`
- `scripts/check/config/preview-rehearsal.config.mjs`

That keeps the command surface stable while letting each product swap env contracts, preflight steps, and route expectations.
The harness validates config shape at startup so broken route assertions or readiness definitions fail fast.

## Standard flow

1. document the env contract in `.env.example` or the relevant process doc
2. add a repo-local `npm run check:<provider> -- status` command
3. verify the smallest useful action from local CLI first
4. keep expected failures explicit in the command output and docs
5. only then wire browser flows, E2E, preview, or production checks around that provider

## Weak point first

The easiest mistake is to start from the browser and assume the failure is in UI wiring.

In practice, provider rollout failures usually come from one of these:

- wrong env value or missing secret
- provider-side feature not enabled
- callback / redirect mismatch
- network reachability or account-level permissions

If the first reproducible check is already a browser flow, you cannot tell which layer is broken quickly.

## Command naming guidance

Use repo-local names that make the entry point obvious:

- `npm run check:<provider> -- status`
- `npm run check:<provider> -- smoke`
- `npm run check:<provider> -- <smallest-useful-action>`
- `npm run check:preview -- --base-url https://<preview-domain>`

The exact subcommands can vary by provider. The important rule is that the command exists inside the repository and can be run without opening the browser first.

## What the command should print

At minimum, the check command should make these visible:

- target endpoint, project, or region
- whether the required env values are present
- whether authentication reached the provider successfully
- whether the critical capability for this product is enabled
- the next expected step when the check passes

## Documentation checklist

When you add a new provider check, also document:

- required environment variables
- a sample invocation
- the smallest useful success signal
- common failure modes and how to distinguish them
- whether preview / production rehearsal needs an extra command

## Strict observability rule

Use `check:preview` in two modes:

- local debugging: default non-strict mode to confirm route and provider reachability first
- preview promotion or production rollout: `npm run check:preview -- --base-url https://<target-domain> --strict-observability true`

If the result must feed CI or review automation, use `--json`.

## Relationship to other docs

- use [infrastructure-continuity.md](./infrastructure-continuity.md) to preserve existing provider accounts and env contracts
- use [local-observability.md](./local-observability.md) so local logs remain enough to inspect the integration
- use [harness-implementation-checklist.md](./harness-implementation-checklist.md) to ensure the provider rollout is not treated as an ad hoc exception

## Starter sample behavior

The sample starter config checks these routes by default:

- `/login`
- `/events`
- `/dashboard`

`/dashboard` is expected to redirect to `/login` unless a session already exists.

## Non-goal

This document does not prescribe one universal provider script shape.

It standardizes the order: local CLI first, browser and preview after that.
