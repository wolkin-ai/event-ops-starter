# Boundary Validation

## Goal

Keep agent-written code safe at system edges by validating input and output contracts explicitly.

## Rules

1. Route handlers must validate request bodies before use.
2. Route handlers must validate response payloads before returning them.
3. Error payloads must include a stable `code` and a `requestId`.
4. Adapter boundaries should validate external input and output before values cross into application or domain layers.
5. Domain and application code must not depend on transport-specific validation details.
6. Expected failures should be mapped once at the route boundary to stable HTTP `status` and `code`.
7. Unexpected failures should fall back to a generic 500 response and stay detailed only in logs.

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

## Structured error handling

Use one error shape per boundary instead of scattering ad hoc `try/catch` blocks.

- domain and application may reject invalid input or impossible state, but they should not construct HTTP payloads
- route handlers own the translation from app/domain failure to HTTP `status`, stable `code`, and response body
- expected failures should keep user-fixable detail on 4xx responses only
- unexpected failures should log enough context for inspection and return a generic fallback message

For Next.js routes in this starter:

- use `RouteContractError` when the route itself knows the exact `status` / `code`
- use `errorResponse` for explicit branch cases like auth, mismatch, or not found
- use `handleRouteError` as the single fallback path for thrown failures

This keeps error behavior reviewable and prevents provider-specific messages from leaking across layers.

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
