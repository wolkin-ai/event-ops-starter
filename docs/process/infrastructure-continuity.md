# Infrastructure Continuity

## Goal

Let a derived product rebuild or refactor its implementation without accidentally replacing the hosted providers, deployment targets, or environment contracts it already depends on.

This starter is local-first by default, so this document becomes active only after a real product adopts hosted services.

## Preserve by default

- the current hosting target and connected deployment account
- the current auth / database / storage / queue provider account
- the current environment variable names for those providers
- the CI/CD path that publishes to those targets

## Rules

- once a product has a connected hosted provider, resource identity matters more than current implementation details
- renaming or dropping an established env var counts as an infrastructure change
- replacing a provider account requires a migration plan, not an incidental refactor
- preview / production assumptions, workflows, and docs should move together

## Before changing infra-facing code

1. Confirm whether the change alters deployment configuration or only application behavior.
2. Confirm whether existing secrets and environment variable names still work.
3. Update docs, verification commands, and workflows together when deployment assumptions move.
4. Keep the local-first startup path working unless the product explicitly approves a new bootstrap requirement.

## External provider rule

When a new hosted provider is introduced:

1. define the env contract and preserve existing env names unless a migration is approved
2. add or update a repo-local `npm run check:<provider>` command
3. verify provider reachability and the smallest useful action from local CLI first
4. document the check command, required envs, and expected failures
5. only then wire browser flows, E2E, preview, or production rollout around that provider

## Why this order exists

- provider failures are easier to isolate before UI state and deployment noise are involved
- local reproduction is faster and cheaper than debugging through preview or production first
- the same check command becomes the future incident-triage entry point

## Preview and production rehearsal

Once a product has hosted preview or production environments, add a repo-local rehearsal command before promotion. A typical pattern is:

1. `npm run check:<provider> -- status`
2. `npm run check:observability`
3. `npm run check:preview -- --base-url https://<preview-domain>`
4. only then run browser validation or promote the release

The exact command names can differ, but the order should stay the same.

## Non-goal

This document does not require the starter itself to ship hosted infrastructure on day one.

It only defines how a derived product should preserve already-chosen infrastructure once hosted services become part of the runtime.
