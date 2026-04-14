import { describe, expect, it } from 'vitest';

import {
  buildReadinessStatuses,
  summarizePendingStatuses,
  validateReadinessConfig,
} from '../../../scripts/check/lib/observability-readiness.mjs';

function withEnv(values: Record<string, string>): NodeJS.ProcessEnv {
  return {
    ...process.env,
    ...values,
  };
}

describe('observability-readiness', () => {
  it('treats blank env values as missing', () => {
    const statuses = buildReadinessStatuses(
      [
        {
          id: 'sentry-client',
          env: 'NEXT_PUBLIC_SENTRY_DSN',
          readyDetail: 'configured',
          pendingDetail: 'missing',
        },
      ],
      withEnv({
        NEXT_PUBLIC_SENTRY_DSN: '   ',
      }),
    );

    expect(statuses).toEqual([
      {
        id: 'sentry-client',
        ready: false,
        detail: 'missing',
      },
    ]);
  });

  it('supports anyOf and allOf definitions', () => {
    const statuses = buildReadinessStatuses(
      [
        {
          id: 'sentry-server',
          anyOf: ['SENTRY_DSN', 'NEXT_PUBLIC_SENTRY_DSN'],
          readyDetail: ({ values }: { values: Record<string, string> }) =>
            `using:${values.NEXT_PUBLIC_SENTRY_DSN}`,
          pendingDetail: 'server missing',
        },
        {
          id: 'sentry-release-upload',
          allOf: ['SENTRY_AUTH_TOKEN', 'SENTRY_ORG', 'SENTRY_PROJECT'],
          readyDetail: 'release upload ready',
          pendingDetail: 'release upload missing',
        },
      ],
      withEnv({
        NEXT_PUBLIC_SENTRY_DSN: 'https://public@example.ingest.sentry.io/123',
        SENTRY_AUTH_TOKEN: 'token',
        SENTRY_ORG: 'org',
      }),
    );

    expect(statuses).toEqual([
      {
        id: 'sentry-server',
        ready: true,
        detail: 'using:https://public@example.ingest.sentry.io/123',
      },
      {
        id: 'sentry-release-upload',
        ready: false,
        detail: 'release upload missing',
      },
    ]);
  });

  it('treats invalid but present values as pending when a validator fails', () => {
    const statuses = buildReadinessStatuses(
      [
        {
          id: 'sentry-server',
          env: 'SENTRY_DSN',
          validate: ({ values }: { values: Record<string, string> }) =>
            values.SENTRY_DSN.startsWith('https://'),
          readyDetail: 'configured',
          pendingDetail: 'missing',
          invalidDetail: 'invalid',
        },
      ],
      withEnv({
        SENTRY_DSN: 'SENTRY_DSN=https://example.invalid/123',
      }),
    );

    expect(statuses).toEqual([
      {
        id: 'sentry-server',
        ready: false,
        detail: 'invalid',
      },
    ]);
  });

  it('rejects invalid config definitions', () => {
    expect(() =>
      validateReadinessConfig({
        title: 'Observability readiness',
        checks: [
          {
            id: 'broken',
            readyDetail: 'configured',
            pendingDetail: 'missing',
          },
        ],
      }),
    ).toThrow(/env \/ anyOf \/ allOf/);
  });

  it('summarizes only pending statuses', () => {
    expect(
      summarizePendingStatuses([
        { id: 'client', ready: false, detail: 'missing' },
        { id: 'release-upload', ready: true, detail: 'configured' },
        { id: 'server', ready: false, detail: 'missing' },
      ]),
    ).toEqual(['client', 'server']);
  });
});
