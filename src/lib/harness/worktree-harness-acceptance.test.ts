import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import {
  chmod,
  mkdtemp,
  mkdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

import { describe, expect, it } from 'vitest';

const harnessScriptPath = path.resolve(
  process.cwd(),
  'scripts/worktree-harness.mjs',
);

describe.sequential('worktree-harness acceptance', () => {
  it('manages a worktree lifecycle against a temporary git repository', async () => {
    const tempRoot = await mkdtemp(
      path.join(os.tmpdir(), 'event-ops-worktree-harness-'),
    );

    try {
      const repoRoot = path.join(tempRoot, 'fixture-repo');
      const worktreeRoot = path.join(tempRoot, 'fixture-repo-agent');
      const appPort = await findOpenPort();
      const storybookPort = await findOpenPort();

      await createFixtureRepository(repoRoot);

      const createOutput = runHarness(repoRoot, [
        'create',
        'agent',
        '--path',
        worktreeRoot,
        '--host',
        '127.0.0.1',
        '--app-port',
        String(appPort),
        '--storybook-port',
        String(storybookPort),
        '--skip-db-prepare',
        '--link-node-modules',
      ]);

      expect(createOutput).toContain('agent');
      expect(createOutput).toContain(`app: 127.0.0.1:${String(appPort)}`);
      expect(createOutput).toContain(
        `storybook: 127.0.0.1:${String(storybookPort)}`,
      );

      const envContent = await readFile(
        path.join(worktreeRoot, '.env'),
        'utf8',
      );
      expect(envContent).toContain('WORKTREE_NAME="agent"');
      expect(envContent).toContain(`WORKTREE_APP_PORT="${String(appPort)}"`);

      const listOutput = runHarness(repoRoot, ['list']);
      expect(listOutput).toContain('agent');

      const startOutput = runHarness(repoRoot, ['start', 'agent', 'all']);
      expect(startOutput).toContain(
        `app: 127.0.0.1:${String(appPort)} (running)`,
      );
      expect(startOutput).toContain(
        `storybook: 127.0.0.1:${String(storybookPort)} (running)`,
      );

      const appResponse = await fetch(`http://127.0.0.1:${String(appPort)}`);
      expect(appResponse.status).toBe(200);
      expect(await appResponse.text()).toContain('fake harness server');

      const storybookResponse = await fetch(
        `http://127.0.0.1:${String(storybookPort)}`,
      );
      expect(storybookResponse.status).toBe(200);

      const statusOutput = runHarness(repoRoot, ['status', 'agent']);
      expect(statusOutput).toContain(
        `app: 127.0.0.1:${String(appPort)} (running)`,
      );
      expect(statusOutput).toContain(
        `storybook: 127.0.0.1:${String(storybookPort)} (running)`,
      );
      expect(statusOutput).toContain('app log:');
      expect(statusOutput).toContain('storybook log:');

      const stopOutput = runHarness(repoRoot, ['stop', 'agent', 'all']);
      expect(stopOutput).toContain('Stopped all for agent.');

      const stoppedOutput = runHarness(repoRoot, ['status', 'agent']);
      expect(stoppedOutput).toContain(
        `app: 127.0.0.1:${String(appPort)} (stopped)`,
      );
      expect(stoppedOutput).toContain(
        `storybook: 127.0.0.1:${String(storybookPort)} (stopped)`,
      );

      const removeOutput = runHarness(repoRoot, [
        'remove',
        'agent',
        '--force',
        '--delete-branch',
      ]);
      expect(removeOutput).toContain('Removed worktree agent.');

      const state = await readHarnessState(repoRoot);
      expect(state).toEqual({});

      const gitWorktreeList = runGit(repoRoot, ['worktree', 'list']);
      expect(gitWorktreeList).not.toContain(worktreeRoot);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

async function createFixtureRepository(repoRoot: string) {
  await mkdir(path.join(repoRoot, 'node_modules', '.bin'), { recursive: true });
  await writeFile(
    path.join(repoRoot, 'package.json'),
    JSON.stringify(
      {
        name: 'fixture-repo',
        private: true,
      },
      null,
      2,
    ),
    'utf8',
  );
  await writeFile(path.join(repoRoot, '.env.example'), 'FIXTURE="1"\n', 'utf8');
  await writeFile(
    path.join(repoRoot, 'node_modules', 'fake-dev-server.mjs'),
    `import { createServer } from 'node:http';

const args = process.argv.slice(2);
const host = readFlag(args, '--hostname') ?? readFlag(args, '--host') ?? '127.0.0.1';
const port = Number(readFlag(args, '--port') ?? '3000');

const server = createServer((_request, response) => {
  response.statusCode = 200;
  response.end('fake harness server');
});

server.listen(port, host);

const shutdown = () => {
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

function readFlag(values, name) {
  const index = values.indexOf(name);

  if (index === -1) {
    return undefined;
  }

  return values[index + 1];
}
`,
    'utf8',
  );
  await writeFile(
    path.join(repoRoot, 'node_modules', '.bin', 'next'),
    '#!/usr/bin/env bash\nexec node "$(dirname "$0")/../fake-dev-server.mjs" "$@"\n',
    'utf8',
  );
  await writeFile(
    path.join(repoRoot, 'node_modules', '.bin', 'storybook'),
    '#!/usr/bin/env bash\nexec node "$(dirname "$0")/../fake-dev-server.mjs" "$@"\n',
    'utf8',
  );
  await chmod(path.join(repoRoot, 'node_modules', '.bin', 'next'), 0o755);
  await chmod(path.join(repoRoot, 'node_modules', '.bin', 'storybook'), 0o755);

  runGit(repoRoot, ['init']);
  runGit(repoRoot, ['config', 'user.name', 'Harness Test']);
  runGit(repoRoot, ['config', 'user.email', 'harness@example.com']);
  runGit(repoRoot, ['add', '.']);
  runGit(repoRoot, ['commit', '-m', 'fixture']);
}

async function findOpenPort() {
  return await new Promise<number>((resolve, reject) => {
    const server = createServer();

    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();

      if (address === null || typeof address === 'string') {
        reject(new Error('Failed to resolve temporary port.'));
        return;
      }

      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(address.port);
      });
    });
  });
}

function runHarness(cwd: string, args: string[]) {
  return execFileSync(process.execPath, [harnessScriptPath, ...args], {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 60_000,
  }).trim();
}

function runGit(cwd: string, args: string[]) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 30_000,
  }).trim();
}

async function readHarnessState(repoRoot: string) {
  const gitCommonDir = path.resolve(
    repoRoot,
    runGit(repoRoot, [
      'rev-parse',
      '--path-format=absolute',
      '--git-common-dir',
    ]),
  );
  const statePath = path.join(
    gitCommonDir,
    'codex-worktree-harness',
    'state.json',
  );

  return JSON.parse(await readFile(statePath, 'utf8'));
}
