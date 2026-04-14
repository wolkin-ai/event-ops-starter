import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  runPostgresCheck,
  validatePostgresCheckConfig,
} from '../../../scripts/check/lib/postgres-check.mjs';

const originalExitCode = process.exitCode;

afterEach(() => {
  process.exitCode = originalExitCode;
  vi.restoreAllMocks();
});

describe('postgres-check', () => {
  it('rejects non-postgres urls', () => {
    expect(() =>
      validatePostgresCheckConfig({
        databaseUrl: 'file:./dev.db',
      }),
    ).toThrow(/postgresql:\/\//);
  });

  it('prints machine-readable output for smoke mode', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const endSpy = vi.fn().mockResolvedValue(undefined);
    const querySpy = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [{ ok: 1 }],
      })
      .mockResolvedValueOnce({
        rows: [
          { table_name: 'EventPlan' },
          { table_name: 'EventPublication' },
          { table_name: 'Registration' },
        ],
      })
      .mockResolvedValueOnce({
        rows: [{ count: 2 }],
      });

    const result = (await runPostgresCheck({
      argv: ['--mode', 'smoke', '--json'],
      env: {
        DATABASE_URL:
          'postgresql://eventops:eventops_dev@127.0.0.1:5434/event_ops_dev?schema=public',
      },
      poolFactory: () => ({
        query: querySpy,
        end: endSpy,
      }),
    }))!;

    expect(querySpy).toHaveBeenCalledTimes(3);
    expect(endSpy).toHaveBeenCalledTimes(1);
    expect(result.ok).toBe(true);
    expect(result.summary).toEqual({
      provider: true,
      schema: true,
      sampleData: true,
    });
    expect(JSON.parse(logSpy.mock.calls[0][0])).toMatchObject({
      ok: true,
      mode: 'smoke',
      summary: {
        provider: true,
        schema: true,
        sampleData: true,
      },
    });
  });
});
