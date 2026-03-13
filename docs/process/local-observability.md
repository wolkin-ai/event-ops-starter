# Local Observability

## Goal

Make local debugging legible for both humans and agents without requiring a hosted observability stack.

## Default signals

- structured JSON logs from route handlers
- `x-request-id` response header on API responses
- `requestId` and `code` in API error payloads
- Storybook interaction tests
- Playwright end-to-end tests

## How to use it

Run the app with a more verbose log level when needed:

```bash
LOG_LEVEL=debug npm run dev
```

When using parallel worktrees, inspect the shared harness state instead of guessing:

```bash
./bin/worktree-harness inspect <name>
./bin/worktree-harness logs <name> app
./bin/worktree-harness logs <name> storybook
./bin/worktree-harness observe <name> metrics
./bin/worktree-harness observe <name> traces
```

`inspect` prints a JSON snapshot with `branch`, `path`, `host`, `envSource`, and per-target `url` / `pid` / `logPath` / `startedAt`.
`logs` prints the most recent lines from the shared harness log for the requested target.
`observe` reads worktree-local trace samples and aggregated request metrics from files under the shared harness directory.

Default behavior:

- local development: `info`
- CI and tests: `warn`

## What to look for

- `request.completed`
- `request.failed`
- `request.validation.failed`
- `response.validation.failed`

Each log line includes:

- `timestamp`
- `level`
- `scope`
- `route`
- `method`
- `requestId`

## Current limit

This starter now ships a minimal local-first trace and metrics harness for HTTP route work. If a new product needs deeper runtime analysis, add one local-first layer at a time:

1. structured logs
2. trace viewer or richer aggregation UI
3. lightweight local metrics dashboard

Do not require a hosted observability service before the product can boot locally.
