import { describe, expect, it } from 'vitest';

import {
  allocateWorktreeRuntime,
  createInitialRecord,
  defaultBranchName,
  defaultWorktreePath,
  parseWorktreeListPorcelain,
  renderEnvFile,
  validateWorktreeName,
} from '../../../scripts/worktree-harness-lib.mjs';

describe('worktree-harness-lib', () => {
  it('builds default branch names with the codex prefix', () => {
    expect(defaultBranchName('admin-publication')).toBe(
      'codex/admin-publication',
    );
  });

  it('rejects invalid worktree names', () => {
    expect(() => validateWorktreeName('Admin')).toThrow(
      'Worktree name must use lowercase letters, numbers, or hyphens.',
    );
  });

  it('allocates the next free host and ports', () => {
    const first = createInitialRecord({
      name: 'alpha',
      branch: 'codex/alpha',
      worktreePath: '/tmp/repo-alpha',
      host: '127.0.0.1',
      appPort: 3001,
      storybookPort: 6007,
      envSource: '.env',
    });
    const second = createInitialRecord({
      name: 'beta',
      branch: 'codex/beta',
      worktreePath: '/tmp/repo-beta',
      host: '127.0.0.1',
      appPort: 3002,
      storybookPort: 6008,
      envSource: '.env',
    });

    expect(allocateWorktreeRuntime([first, second])).toEqual({
      host: '127.0.0.1',
      appPort: 3003,
      storybookPort: 6009,
    });
  });

  it('renders a worktree env file with derived metadata', () => {
    const record = createInitialRecord({
      name: 'ops-cleanup',
      branch: 'codex/ops-cleanup',
      worktreePath: '/tmp/repo-ops-cleanup',
      host: '127.0.0.20',
      appPort: 3001,
      storybookPort: 6007,
      envSource: '.env',
    });

    expect(
      renderEnvFile(
        [
          'DATABASE_URL="postgresql://eventops:eventops_dev@127.0.0.1:5434/event_ops_dev?schema=public"',
          'NEXT_PUBLIC_APP_URL="http://127.0.0.1:3000"',
          'AUTH_SECRET="change-me"',
          'AUTH_URL="http://127.0.0.1:3000"',
        ].join('\n'),
        {
          ...record,
          observabilityDir: '/tmp/repo-ops-cleanup/.observability',
          traceFile: '/tmp/repo-ops-cleanup/.observability/traces.ndjson',
          metricsFile: '/tmp/repo-ops-cleanup/.observability/metrics.ndjson',
        },
      ),
    ).toContain('WORKTREE_NAME="ops-cleanup"');
    expect(
      renderEnvFile(
        [
          'DATABASE_URL="postgresql://eventops:eventops_dev@127.0.0.1:5434/event_ops_dev?schema=public"',
          'NEXT_PUBLIC_APP_URL="http://127.0.0.1:3000"',
          'AUTH_SECRET="change-me"',
          'AUTH_URL="http://127.0.0.1:3000"',
        ].join('\n'),
        {
          ...record,
          observabilityDir: '/tmp/repo-ops-cleanup/.observability',
          traceFile: '/tmp/repo-ops-cleanup/.observability/traces.ndjson',
          metricsFile: '/tmp/repo-ops-cleanup/.observability/metrics.ndjson',
        },
      ),
    ).toContain(
      'WORKTREE_TRACE_FILE="/tmp/repo-ops-cleanup/.observability/traces.ndjson"',
    );
  });

  it('accepts an explicit host override', () => {
    expect(allocateWorktreeRuntime([], { host: '127.0.0.20' })).toEqual({
      host: '127.0.0.20',
      appPort: 3001,
      storybookPort: 6007,
    });
  });

  it('parses git worktree porcelain output', () => {
    const output = `worktree /repo\nHEAD abc123\nbranch refs/heads/main\n\nworktree /repo-admin\nHEAD def456\nbranch refs/heads/codex/admin\n`;

    expect(parseWorktreeListPorcelain(output)).toEqual([
      {
        path: '/repo',
        head: 'abc123',
        branch: 'main',
      },
      {
        path: '/repo-admin',
        head: 'def456',
        branch: 'codex/admin',
      },
    ]);
  });

  it('builds default sibling paths', () => {
    expect(defaultWorktreePath('/repo/event-ops-starter', 'ops')).toBe(
      '/repo/event-ops-starter-ops',
    );
  });
});
