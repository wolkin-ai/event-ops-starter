import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  runPreviewRehearsal,
  validatePreviewRehearsalConfig,
} from '../../../scripts/check/lib/preview-rehearsal.mjs';

const originalExitCode = process.exitCode;

afterEach(() => {
  process.exitCode = originalExitCode;
  vi.restoreAllMocks();
});

describe('preview-rehearsal', () => {
  it('rejects routes that do not declare an assertion', () => {
    expect(() =>
      validatePreviewRehearsalConfig({
        title: 'Preview / test rehearsal',
        failurePrefix: 'Preview rehearsal failed',
        routes: [
          {
            path: '/login',
          },
        ],
      }),
    ).toThrow(/whenRendered|whenRedirect/);
  });

  it('prints machine-readable output with route and observability summaries', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response('Login screen', {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(null, {
          status: 307,
          headers: {
            location: '/login',
          },
        }),
      );

    const result = await runPreviewRehearsal(
      {
        title: 'Preview / test rehearsal',
        failurePrefix: 'Preview rehearsal failed',
        requiredEnvNames: ['AUTH_SECRET'],
        preflightSteps: [
          {
            label: 'local preflight',
            summaryLabel: 'local preflight',
            command: process.execPath,
            args: ['-e', "console.log('preflight ok')"],
          },
        ],
        observability: {
          title: 'Observability readiness',
          sectionLabel: 'check:observability',
          checks: [
            {
              id: 'sentry-client',
              env: 'NEXT_PUBLIC_SENTRY_DSN',
              readyDetail: 'configured',
              pendingDetail: 'missing',
            },
          ],
        },
        routes: [
          {
            path: '/login',
            whenRendered: {
              bodyIncludes: ['Login'],
            },
          },
          {
            path: '/dashboard',
            whenRedirect: {
              locationIncludesAny: ['/login'],
            },
          },
        ],
      },
      {
        argv: ['--base-url', 'http://127.0.0.1:3000', '--json'],
        env: {
          AUTH_SECRET: 'secret',
          NEXT_PUBLIC_SENTRY_DSN: 'https://public@example.ingest.sentry.io/123',
        },
      },
    );

    if (result === undefined) {
      throw new Error('Expected preview rehearsal to return a result.');
    }

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(true);
    expect(result.summary).toEqual({
      appRoutes: {
        ready: true,
        checked: 2,
      },
      preflight: [
        {
          id: 'local preflight',
          ready: true,
        },
      ],
      observability: {
        status: 'ready',
        ready: true,
        pending: [],
      },
    });
    expect(result.routes).toEqual([
      {
        path: '/login',
        ready: true,
        mode: 'rendered',
        status: 200,
        detail: 'rendered',
      },
      {
        path: '/dashboard',
        ready: true,
        mode: 'redirected',
        status: 307,
        location: '/login',
        detail: 'redirected -> /login',
      },
    ]);
    expect(result.preflightSteps).toEqual([
      {
        id: 'local preflight',
        ready: true,
        detail: 'local preflight succeeded.',
        stdout: 'preflight ok',
        stderr: undefined,
      },
    ]);

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(JSON.parse(logSpy.mock.calls[0][0])).toMatchObject({
      ok: true,
      baseUrl: 'http://127.0.0.1:3000',
      targetEnv: 'development',
      preflightSteps: [
        {
          stdout: 'preflight ok',
        },
      ],
      observability: {
        pending: [],
      },
    });
  });
});
