# Boundary Validation

## Goal

Keep agent-written code safe at system edges by validating input and output contracts explicitly.

## Rules

1. Route handlers must validate request bodies before use.
2. Route handlers must validate response payloads before returning them.
3. Error payloads must include a stable `code` and a `requestId`.
4. Adapter boundaries should validate external input and output before values cross into application or domain layers.
5. Domain and application code must not depend on transport-specific validation details.

## Current project rule

For Next.js route handlers, use the helpers in `src/lib/http/route-contract.ts`:

- `createRouteContext`
- `readRequestJson`
- `jsonResponse`
- `errorResponse`
- `handleRouteError`

This keeps route behavior consistent and makes request tracing easier in local logs.

## Minimum pattern

1. Build a route-scoped context.
2. Validate request JSON with `readRequestJson`.
3. Return success payloads through `jsonResponse`.
4. Return explicit 403/404/400 responses through `errorResponse`.
5. Funnel unexpected failures through `handleRouteError`.

## External adapters

When a new external service is added later:

- validate provider responses before mapping them into ports
- validate outbound payloads before sending them to the provider
- keep provider schemas inside infrastructure, not in domain/application

## Repo guard

This repository enforces the adapter-side contract pattern through:

```bash
npm run boundary:check
```

Current guardrails:

- adapter implementation files under `src/features/**/infrastructure/adapters/*.ts` must import a same-slice `*-contract.ts` module
- adapter implementation files must not import `zod` directly
- adapter implementation files must not import `@/lib/event-records` directly

This is a structural guard, not a semantic proof. It keeps the boundary-contract pattern visible and reviewable.

## Non-goal

This rule does not require every internal function call to use Zod. It only standardizes validation at replaceable system boundaries.
