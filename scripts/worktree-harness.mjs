#!/usr/bin/env node
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import {
  allocateWorktreeRuntime,
  createInitialRecord,
  defaultBranchName,
  defaultWorktreePath,
  toDisplayRecord,
  validateWorktreeName,
  renderEnvFile,
} from './worktree-harness-lib.mjs';

const NPM_COMMAND = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const VALID_TARGETS = new Set(['app', 'storybook', 'all']);
const STARTUP_TIMEOUT_MS = 30_000;
const STARTUP_POLL_MS = 500;
const LOCK_TIMEOUT_MS = 120_000;
const LOCK_POLL_MS = 200;
const LOG_TAIL_LINES = 40;
const VALID_OBSERVE_TARGETS = new Set(['traces', 'metrics', 'all']);

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'create':
      await handleCreate(process.argv.slice(3));
      return;
    case 'start':
      await handleStart(process.argv.slice(3));
      return;
    case 'stop':
      await handleStop(process.argv.slice(3));
      return;
    case 'remove':
      await handleRemove(process.argv.slice(3));
      return;
    case 'list':
      await handleList();
      return;
    case 'status':
      await handleStatus(process.argv.slice(3));
      return;
    case 'logs':
      await handleLogs(process.argv.slice(3));
      return;
    case 'inspect':
      await handleInspect(process.argv.slice(3));
      return;
    case 'observe':
      await handleObserve(process.argv.slice(3));
      return;
    case 'help':
    case '--help':
    case '-h':
    case undefined:
      printHelp();
      return;
    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

async function handleCreate(args) {
  await withHarnessLock(getGitContext().stateDir, async () => {
    const context = getGitContext();
    const options = parseOptions(args);
    const name = validateWorktreeName(
      readRequiredPositional(options, 0, 'name'),
    );
    const state = await readState(context.stateDir);

    if (state[name]) {
      throw new Error(`Worktree "${name}" already exists in harness metadata.`);
    }

    const branch = options.branch ?? defaultBranchName(name);
    const worktreePath = path.resolve(
      options.path ?? defaultWorktreePath(context.canonicalRoot, name),
    );
    const runtime = allocateWorktreeRuntime(Object.values(state), {
      appPort: readIntegerOption(options.appPort, 'appPort'),
      storybookPort: readIntegerOption(options.storybookPort, 'storybookPort'),
      host: readStringOption(options.host, 'host'),
    });
    const record = createInitialRecord({
      name,
      branch,
      worktreePath,
      host: runtime.host,
      appPort: runtime.appPort,
      storybookPort: runtime.storybookPort,
      envSource: 'none',
    });

    runGit(context.canonicalRoot, [
      'worktree',
      'add',
      '-b',
      branch,
      worktreePath,
    ]);

    try {
      record.envSource = await ensureEnvFile(
        context.canonicalRoot,
        context.stateDir,
        record,
      );
      await bootstrapNodeModules(context.canonicalRoot, worktreePath, options);

      if (options.skipDbPrepare !== true) {
        runCommand(worktreePath, NPM_COMMAND, ['run', 'db:prepare']);
      }

      state[name] = record;
      await writeState(context.stateDir, state);

      console.log(toDisplayRecord(record));
      console.log(`  app url: http://${record.host}:${String(record.appPort)}`);
      console.log(
        `  storybook url: http://${record.host}:${String(record.storybookPort)}`,
      );
    } catch (error) {
      try {
        runGit(context.canonicalRoot, [
          'worktree',
          'remove',
          worktreePath,
          '--force',
        ]);
      } catch {
        // best effort cleanup
      }

      try {
        runGit(context.canonicalRoot, ['branch', '-D', branch]);
      } catch {
        // best effort cleanup
      }

      throw error;
    }
  });
}

async function handleStart(args) {
  await withHarnessLock(getGitContext().stateDir, async () => {
    const context = getGitContext();
    const options = parseOptions(args);
    const name = validateWorktreeName(
      readRequiredPositional(options, 0, 'name'),
    );
    const target = readTarget(options.positionals[1]);
    const state = await readState(context.stateDir);
    const record = readExistingRecord(state, name);
    const nextRecord = await refreshProcessState(record);

    if (!fs.existsSync(path.join(record.path, 'package.json'))) {
      throw new Error(`Worktree path does not look valid: ${record.path}`);
    }

    await ensureEnvFile(context.canonicalRoot, context.stateDir, nextRecord);
    await bootstrapNodeModules(context.canonicalRoot, record.path, {});
    const nextBinary = resolveLocalBinary(record.path, 'next');
    const storybookBinary = resolveLocalBinary(record.path, 'storybook');

    if (target === 'app' || target === 'all') {
      nextRecord.processes.app = await ensureStarted(
        context.stateDir,
        nextRecord,
        'app',
        nextBinary,
        [
          'dev',
          '--hostname',
          nextRecord.host,
          '--port',
          String(nextRecord.appPort),
        ],
        `http://${nextRecord.host}:${String(nextRecord.appPort)}`,
      );
    }

    if (target === 'storybook' || target === 'all') {
      nextRecord.processes.storybook = await ensureStarted(
        context.stateDir,
        nextRecord,
        'storybook',
        storybookBinary,
        [
          'dev',
          '--host',
          nextRecord.host,
          '--port',
          String(nextRecord.storybookPort),
        ],
        `http://${nextRecord.host}:${String(nextRecord.storybookPort)}`,
      );
    }

    state[name] = nextRecord;
    await writeState(context.stateDir, state);
    console.log(
      toDisplayRecord(nextRecord, {
        appRunning: nextRecord.processes.app !== null,
        storybookRunning: nextRecord.processes.storybook !== null,
      }),
    );
  });
}

async function handleStop(args) {
  await withHarnessLock(getGitContext().stateDir, async () => {
    const context = getGitContext();
    const options = parseOptions(args);
    const name = validateWorktreeName(
      readRequiredPositional(options, 0, 'name'),
    );
    const target = readTarget(options.positionals[1]);
    const state = await readState(context.stateDir);
    const record = await refreshProcessState(readExistingRecord(state, name));

    if (target === 'app' || target === 'all') {
      await stopProcess(record.processes.app);
      record.processes.app = null;
    }

    if (target === 'storybook' || target === 'all') {
      await stopProcess(record.processes.storybook);
      record.processes.storybook = null;
    }

    state[name] = record;
    await writeState(context.stateDir, state);
    console.log(`Stopped ${target} for ${name}.`);
  });
}

async function handleRemove(args) {
  await withHarnessLock(getGitContext().stateDir, async () => {
    const context = getGitContext();
    const options = parseOptions(args);
    const name = validateWorktreeName(
      readRequiredPositional(options, 0, 'name'),
    );
    const state = await readState(context.stateDir);
    const record = await refreshProcessState(readExistingRecord(state, name));

    await stopProcess(record.processes.app);
    await stopProcess(record.processes.storybook);

    runGit(context.canonicalRoot, [
      'worktree',
      'remove',
      record.path,
      ...(options.force === true ? ['--force'] : []),
    ]);

    if (options.deleteBranch === true) {
      runGit(context.canonicalRoot, ['branch', '-D', record.branch]);
    }

    delete state[name];
    await writeState(context.stateDir, state);
    await cleanupLogs(context.stateDir, name);
    await cleanupObservability(context.stateDir, name);
    console.log(`Removed worktree ${name}.`);
  });
}

async function handleList() {
  const context = getGitContext();
  const state = await readState(context.stateDir);
  const names = Object.keys(state).sort();

  if (names.length === 0) {
    console.log('No managed worktrees.');
    return;
  }

  for (const name of names) {
    const record = await refreshProcessState(state[name]);
    console.log(
      toDisplayRecord(record, {
        appRunning: record.processes.app !== null,
        storybookRunning: record.processes.storybook !== null,
      }),
    );
  }
}

async function handleStatus(args) {
  const context = getGitContext();
  const options = parseOptions(args);
  const state = await readState(context.stateDir);
  const name = options.positionals[0];

  if (name === undefined) {
    await handleList();
    return;
  }

  const record = await refreshProcessState(
    readExistingRecord(state, validateWorktreeName(name)),
  );

  console.log(
    toDisplayRecord(record, {
      appRunning: record.processes.app !== null,
      storybookRunning: record.processes.storybook !== null,
    }),
  );

  if (record.processes.app !== null) {
    console.log(`  app log: ${record.processes.app.logPath}`);
  }

  if (record.processes.storybook !== null) {
    console.log(`  storybook log: ${record.processes.storybook.logPath}`);
  }
}

async function handleLogs(args) {
  const context = getGitContext();
  const options = parseOptions(args);
  const name = validateWorktreeName(readRequiredPositional(options, 0, 'name'));
  const target = readTarget(options.positionals[1]);
  const state = await readState(context.stateDir);
  const record = await refreshProcessState(readExistingRecord(state, name));
  const kinds = target === 'all' ? ['app', 'storybook'] : [target];
  const sections = await Promise.all(
    kinds.map(async (kind) => {
      const logPath = readProcessLogPath(context.stateDir, record, kind);
      const output = await readLogTail(logPath, LOG_TAIL_LINES);

      return [
        `${kind} log: ${logPath}`,
        output === '' ? '(no log output yet)' : output,
      ].join('\n');
    }),
  );

  console.log(sections.join('\n\n'));
}

async function handleInspect(args) {
  const context = getGitContext();
  const options = parseOptions(args);
  const name = validateWorktreeName(readRequiredPositional(options, 0, 'name'));
  const state = await readState(context.stateDir);
  const record = await refreshProcessState(readExistingRecord(state, name));

  console.log(
    JSON.stringify(buildInspectSnapshot(context.stateDir, record), null, 2),
  );
}

async function handleObserve(args) {
  const context = getGitContext();
  const options = parseOptions(args);
  const name = validateWorktreeName(readRequiredPositional(options, 0, 'name'));
  const target = readObserveTarget(options.positionals[1]);
  const state = await readState(context.stateDir);
  const record = await refreshProcessState(readExistingRecord(state, name));
  const observability = buildObservabilityPaths(context.stateDir, record.name);
  const sections = [];

  if (target === 'metrics' || target === 'all') {
    sections.push(await renderMetricsObservation(observability.metricsFile));
  }

  if (target === 'traces' || target === 'all') {
    sections.push(await renderTraceObservation(observability.traceFile));
  }

  console.log(sections.join('\n\n'));
}

function getGitContext() {
  const cwd = process.cwd();
  const topLevel = path.resolve(
    cwd,
    runGit(cwd, ['rev-parse', '--path-format=absolute', '--show-toplevel']),
  );
  const commonDir = path.resolve(
    cwd,
    runGit(cwd, ['rev-parse', '--path-format=absolute', '--git-common-dir']),
  );
  const canonicalRoot = path.dirname(commonDir);

  return {
    currentTopLevel: topLevel,
    canonicalRoot,
    stateDir: path.join(commonDir, 'codex-worktree-harness'),
  };
}

function runGit(cwd, args) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function runCommand(cwd, command, args) {
  execFileSync(command, args, {
    cwd,
    stdio: 'inherit',
  });
}

async function ensureEnvFile(canonicalRoot, stateDir, record) {
  const sourceCandidates = [
    path.join(canonicalRoot, '.env'),
    path.join(canonicalRoot, '.env.example'),
  ];
  const envPath = path.join(record.path, '.env');

  if (fs.existsSync(envPath)) {
    return 'existing';
  }

  for (const sourcePath of sourceCandidates) {
    if (!fs.existsSync(sourcePath)) {
      continue;
    }

    const baseContent = await fsp.readFile(sourcePath, 'utf8');
    await fsp.writeFile(
      envPath,
      renderEnvFile(baseContent, buildEnvRecord(stateDir, record)),
      'utf8',
    );
    return path.basename(sourcePath);
  }

  await fsp.writeFile(
    envPath,
    renderEnvFile('', buildEnvRecord(stateDir, record)),
    'utf8',
  );
  return 'generated';
}

async function bootstrapNodeModules(canonicalRoot, worktreePath, options) {
  const worktreeModules = path.join(worktreePath, 'node_modules');

  if (fs.existsSync(worktreeModules)) {
    return;
  }

  if (options.linkNodeModules === true) {
    const canonicalModules = path.join(canonicalRoot, 'node_modules');

    if (!fs.existsSync(canonicalModules)) {
      throw new Error(
        `Missing canonical node_modules at ${canonicalModules}. Run npm install in the canonical checkout first.`,
      );
    }

    const relativeTarget = path.relative(worktreePath, canonicalModules);
    await fsp.symlink(
      relativeTarget,
      worktreeModules,
      process.platform === 'win32' ? 'junction' : 'dir',
    );
    return;
  }

  runCommand(worktreePath, NPM_COMMAND, ['install', '--no-fund', '--no-audit']);
}

async function ensureStarted(stateDir, record, kind, command, args, url) {
  const existing = record.processes[kind];

  if (existing !== null && isPidRunning(existing.pid)) {
    return existing;
  }

  await fsp.mkdir(path.join(stateDir, 'logs'), { recursive: true });
  const logPath = path.join(stateDir, 'logs', `${record.name}-${kind}.log`);
  const logHandle = fs.openSync(logPath, 'a');
  const child = spawn(command, args, {
    cwd: record.path,
    detached: true,
    stdio: ['ignore', logHandle, logHandle],
    env: {
      ...process.env,
      ...buildRuntimeEnv(stateDir, record),
    },
  });

  fs.closeSync(logHandle);

  if (child.pid === undefined) {
    throw new Error(`Failed to start ${kind} for ${record.name}.`);
  }

  const processInfo = {
    pid: child.pid,
    fingerprint: readProcessFingerprint(child.pid),
    logPath,
    startedAt: new Date().toISOString(),
    url,
  };

  child.unref();
  await waitForReady(kind, processInfo);
  return processInfo;
}

function resolveLocalBinary(worktreePath, name) {
  const suffix = process.platform === 'win32' ? '.cmd' : '';
  const binaryPath = path.join(
    worktreePath,
    'node_modules',
    '.bin',
    `${name}${suffix}`,
  );

  if (!fs.existsSync(binaryPath)) {
    throw new Error(
      `Missing ${name} binary in ${worktreePath}. Run \`npm install\` there or recreate with --install.`,
    );
  }

  return binaryPath;
}

async function stopProcess(processInfo) {
  if (processInfo === null) {
    return;
  }

  if (!isManagedProcessRunning(processInfo)) {
    return;
  }

  signalManagedProcess(processInfo, 'SIGTERM');
  const startedAt = Date.now();

  while (Date.now() - startedAt < 5_000) {
    if (!isManagedProcessRunning(processInfo)) {
      return;
    }

    await sleep(100);
  }

  if (isManagedProcessRunning(processInfo)) {
    signalManagedProcess(processInfo, 'SIGKILL');
  }
}

async function waitForReady(kind, processInfo) {
  const deadline = Date.now() + STARTUP_TIMEOUT_MS;
  let lastError = null;

  while (Date.now() < deadline) {
    if (!isPidRunning(processInfo.pid)) {
      throw await buildStartupError(
        kind,
        processInfo,
        `${kind} exited before it became reachable.`,
      );
    }

    try {
      const response = await fetch(processInfo.url, {
        method: 'GET',
        signal: AbortSignal.timeout(2_000),
      });

      await response.arrayBuffer();
      return;
    } catch (error) {
      lastError = error;
      await sleep(STARTUP_POLL_MS);
    }
  }

  await stopProcess(processInfo);
  throw await buildStartupError(
    kind,
    processInfo,
    `${kind} did not become reachable within ${String(STARTUP_TIMEOUT_MS)}ms.`,
    lastError,
  );
}

async function buildStartupError(kind, processInfo, message, cause) {
  const suffix = cause instanceof Error ? ` Cause: ${cause.message}` : '';
  const logTail = await readLogTail(processInfo.logPath);

  return new Error(
    [
      `Failed to start ${kind}. ${message} See ${processInfo.logPath}.${suffix}`,
      logTail === '' ? null : '',
      logTail === '' ? null : 'Recent log output:',
      logTail === '' ? null : logTail,
    ]
      .filter((line) => line !== null)
      .join('\n'),
  );
}

async function readLogTail(logPath, lineCount = 20) {
  try {
    const content = await fsp.readFile(logPath, 'utf8');
    return content.trim().split('\n').slice(-lineCount).join('\n');
  } catch {
    return '';
  }
}

function buildInspectSnapshot(stateDir, record) {
  return {
    name: record.name,
    branch: record.branch,
    path: record.path,
    host: record.host,
    envSource: record.envSource,
    createdAt: record.createdAt ?? null,
    observability: buildObservabilityPaths(stateDir, record.name),
    app: buildInspectableProcess(stateDir, record, 'app'),
    storybook: buildInspectableProcess(stateDir, record, 'storybook'),
  };
}

function buildInspectableProcess(stateDir, record, kind) {
  const processInfo = record.processes[kind];
  const port = kind === 'app' ? record.appPort : record.storybookPort;

  return {
    status: processInfo === null ? 'stopped' : 'running',
    port,
    url: `http://${record.host}:${String(port)}`,
    pid: processInfo?.pid ?? null,
    logPath: readProcessLogPath(stateDir, record, kind),
    startedAt: processInfo?.startedAt ?? null,
  };
}

function readProcessLogPath(stateDir, record, kind) {
  return (
    record.processes[kind]?.logPath ?? buildLogPath(stateDir, record.name, kind)
  );
}

function buildLogPath(stateDir, name, kind) {
  return path.join(stateDir, 'logs', `${name}-${kind}.log`);
}

function buildObservabilityPaths(stateDir, name) {
  const directory = path.join(stateDir, 'observability', name);

  return {
    directory,
    traceFile: path.join(directory, 'traces.ndjson'),
    metricsFile: path.join(directory, 'metrics.ndjson'),
  };
}

function buildEnvRecord(stateDir, record) {
  const observability = buildObservabilityPaths(stateDir, record.name);

  return {
    ...record,
    observabilityDir: observability.directory,
    traceFile: observability.traceFile,
    metricsFile: observability.metricsFile,
  };
}

function buildRuntimeEnv(stateDir, record) {
  const observability = buildObservabilityPaths(stateDir, record.name);

  return {
    WORKTREE_NAME: record.name,
    WORKTREE_HOST: record.host,
    WORKTREE_APP_PORT: String(record.appPort),
    WORKTREE_STORYBOOK_PORT: String(record.storybookPort),
    WORKTREE_OBSERVABILITY_DIR: observability.directory,
    WORKTREE_TRACE_FILE: observability.traceFile,
    WORKTREE_METRICS_FILE: observability.metricsFile,
  };
}

async function renderTraceObservation(traceFile) {
  const output = await readLogTail(traceFile, LOG_TAIL_LINES);

  return [
    `traces: ${traceFile}`,
    output === '' ? '(no trace output yet)' : output,
  ].join('\n');
}

async function renderMetricsObservation(metricsFile) {
  const raw = await readLogTail(metricsFile, 10_000);
  const summary = summarizeMetricEntries(parseNdjsonLines(raw));

  return [
    `metrics: ${metricsFile}`,
    summary === null
      ? '(no metric output yet)'
      : JSON.stringify(summary, null, 2),
  ].join('\n');
}

function parseNdjsonLines(raw) {
  if (raw.trim() === '') {
    return [];
  }

  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '')
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter((entry) => entry !== null);
}

function summarizeMetricEntries(entries) {
  if (entries.length === 0) {
    return null;
  }

  const totals = {
    totalRequests: 0,
    byOutcome: {
      success: 0,
      clientError: 0,
      serverError: 0,
    },
    durationMs: {
      min: null,
      avg: 0,
      max: 0,
    },
  };
  const routes = new Map();

  for (const entry of entries) {
    if (
      typeof entry.route !== 'string' ||
      typeof entry.method !== 'string' ||
      !Number.isFinite(entry.durationMs) ||
      (entry.outcome !== 'success' &&
        entry.outcome !== 'client_error' &&
        entry.outcome !== 'server_error')
    ) {
      continue;
    }

    const durationMs = Number(entry.durationMs);
    totals.totalRequests += 1;
    totals.byOutcome[toCamelOutcome(entry.outcome)] += 1;
    totals.durationMs.max = Math.max(totals.durationMs.max, durationMs);
    totals.durationMs.min =
      totals.durationMs.min === null
        ? durationMs
        : Math.min(totals.durationMs.min, durationMs);
    totals.durationMs.avg += durationMs;

    const key = `${entry.route} ${entry.method}`;
    const existing = routes.get(key) ?? {
      route: entry.route,
      method: entry.method,
      count: 0,
      byOutcome: {
        success: 0,
        clientError: 0,
        serverError: 0,
      },
      avgDurationMs: 0,
      maxDurationMs: 0,
    };

    existing.count += 1;
    existing.byOutcome[toCamelOutcome(entry.outcome)] += 1;
    existing.avgDurationMs += durationMs;
    existing.maxDurationMs = Math.max(existing.maxDurationMs, durationMs);
    routes.set(key, existing);
  }

  if (totals.totalRequests === 0) {
    return null;
  }

  totals.durationMs.avg = Number(
    (totals.durationMs.avg / totals.totalRequests).toFixed(2),
  );

  return {
    generatedAt: new Date().toISOString(),
    ...totals,
    routes: Array.from(routes.values())
      .map((routeSummary) => ({
        ...routeSummary,
        avgDurationMs: Number(
          (routeSummary.avgDurationMs / routeSummary.count).toFixed(2),
        ),
      }))
      .sort((left, right) => right.count - left.count),
  };
}

function toCamelOutcome(outcome) {
  if (outcome === 'client_error') {
    return 'clientError';
  }

  if (outcome === 'server_error') {
    return 'serverError';
  }

  return 'success';
}

async function refreshProcessState(record) {
  const nextRecord = structuredClone(record);

  if (
    nextRecord.processes.app !== null &&
    !isManagedProcessRunning(nextRecord.processes.app)
  ) {
    nextRecord.processes.app = null;
  }

  if (
    nextRecord.processes.storybook !== null &&
    !isManagedProcessRunning(nextRecord.processes.storybook)
  ) {
    nextRecord.processes.storybook = null;
  }

  return nextRecord;
}

function isPidRunning(pid) {
  if (typeof pid !== 'number' || !Number.isInteger(pid) || pid <= 0) {
    return false;
  }

  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function readProcessFingerprint(pid) {
  if (process.platform === 'win32') {
    return {
      psStartedAt: null,
      command: null,
    };
  }

  return {
    psStartedAt: readPsValue(pid, 'lstart'),
    command: readPsValue(pid, 'command'),
  };
}

function readPsValue(pid, field) {
  try {
    const value = execFileSync('ps', ['-o', `${field}=`, '-p', String(pid)], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();

    return value === '' ? null : value;
  } catch {
    return null;
  }
}

function isManagedProcessRunning(processInfo) {
  if (processInfo === null || !isPidRunning(processInfo.pid)) {
    return false;
  }

  const fingerprint = processInfo.fingerprint;

  if (!fingerprint) {
    return false;
  }

  const current = readProcessFingerprint(processInfo.pid);

  if (
    fingerprint.psStartedAt !== null &&
    current.psStartedAt !== fingerprint.psStartedAt
  ) {
    return false;
  }

  if (
    fingerprint.psStartedAt === null &&
    fingerprint.command !== null &&
    current.command !== fingerprint.command
  ) {
    return false;
  }

  return true;
}

function signalManagedProcess(processInfo, signal) {
  if (process.platform === 'win32') {
    process.kill(processInfo.pid, signal);
    return;
  }

  process.kill(-processInfo.pid, signal);
}

async function withHarnessLock(stateDir, operation) {
  await fsp.mkdir(stateDir, { recursive: true });
  const lockDir = path.join(stateDir, 'lock');
  const ownerPath = path.join(lockDir, 'owner.json');
  const deadline = Date.now() + LOCK_TIMEOUT_MS;

  while (true) {
    try {
      await fsp.mkdir(lockDir);
      await fsp.writeFile(
        ownerPath,
        JSON.stringify(
          {
            pid: process.pid,
            fingerprint: readProcessFingerprint(process.pid),
            acquiredAt: new Date().toISOString(),
          },
          null,
          2,
        ),
        'utf8',
      );
      break;
    } catch (error) {
      if (!isEexistError(error)) {
        throw error;
      }

      const owner = await readLockOwner(ownerPath);

      if (owner !== null && !isLockOwnerActive(owner)) {
        await fsp.rm(lockDir, { recursive: true, force: true });
        continue;
      }

      if (Date.now() >= deadline) {
        throw new Error(`Timed out waiting for harness lock at ${lockDir}.`);
      }

      await sleep(LOCK_POLL_MS);
    }
  }

  try {
    return await operation();
  } finally {
    await fsp.rm(lockDir, { recursive: true, force: true });
  }
}

async function readLockOwner(ownerPath) {
  try {
    return JSON.parse(await fsp.readFile(ownerPath, 'utf8'));
  } catch {
    return null;
  }
}

function isLockOwnerActive(owner) {
  if (
    owner === null ||
    typeof owner.pid !== 'number' ||
    owner.fingerprint === null ||
    typeof owner.fingerprint !== 'object'
  ) {
    return false;
  }

  return isManagedProcessRunning({
    pid: owner.pid,
    fingerprint: owner.fingerprint,
  });
}

function isEexistError(error) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'EEXIST'
  );
}

async function readState(stateDir) {
  const statePath = path.join(stateDir, 'state.json');

  if (!fs.existsSync(statePath)) {
    return {};
  }

  return JSON.parse(await fsp.readFile(statePath, 'utf8'));
}

async function writeState(stateDir, state) {
  await fsp.mkdir(stateDir, { recursive: true });
  await fsp.writeFile(
    path.join(stateDir, 'state.json'),
    JSON.stringify(state, null, 2),
    'utf8',
  );
}

async function cleanupLogs(stateDir, name) {
  const candidates = [
    buildLogPath(stateDir, name, 'app'),
    buildLogPath(stateDir, name, 'storybook'),
  ];

  for (const filePath of candidates) {
    try {
      await fsp.rm(filePath);
    } catch {
      // best effort cleanup
    }
  }
}

async function cleanupObservability(stateDir, name) {
  try {
    await fsp.rm(buildObservabilityPaths(stateDir, name).directory, {
      recursive: true,
      force: true,
    });
  } catch {
    // best effort cleanup
  }
}

function parseOptions(args) {
  const options = {
    positionals: [],
  };

  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];

    if (!value.startsWith('--')) {
      options.positionals.push(value);
      continue;
    }

    const key = value.slice(2);
    const nextValue = args[index + 1];

    if (nextValue === undefined || nextValue.startsWith('--')) {
      options[toCamelCase(key)] = true;
      continue;
    }

    options[toCamelCase(key)] = nextValue;
    index += 1;
  }

  return options;
}

function toCamelCase(value) {
  return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function readRequiredPositional(options, index, label) {
  const value = options.positionals[index];

  if (value === undefined) {
    throw new Error(`Missing required ${label}.`);
  }

  return value;
}

function readExistingRecord(state, name) {
  const record = state[name];

  if (!record) {
    throw new Error(`Unknown worktree: ${name}`);
  }

  return record;
}

function readIntegerOption(value, label) {
  if (value === undefined || value === true) {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${label} must be a positive integer.`);
  }

  return parsed;
}

function readStringOption(value, label) {
  if (value === undefined || value === true) {
    return undefined;
  }

  const normalized = String(value).trim();

  if (normalized === '') {
    throw new Error(`${label} must be a non-empty string.`);
  }

  return normalized;
}

function readTarget(value) {
  const target = value ?? 'all';

  if (!VALID_TARGETS.has(target)) {
    throw new Error(`Unknown target: ${target}`);
  }

  return target;
}

function readObserveTarget(value) {
  const target = value ?? 'all';

  if (!VALID_OBSERVE_TARGETS.has(target)) {
    throw new Error(`Unknown observe target: ${target}`);
  }

  return target;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function printHelp() {
  console.log(`Usage:
  ./bin/worktree-harness create <name> [--branch codex/<name>] [--path /abs/path] [--app-port 3001] [--storybook-port 6007] [--host 127.0.0.1] [--link-node-modules] [--skip-db-prepare]
  ./bin/worktree-harness start <name> [app|storybook|all]
  ./bin/worktree-harness stop <name> [app|storybook|all]
  ./bin/worktree-harness remove <name> [--force] [--delete-branch]
  ./bin/worktree-harness list
  ./bin/worktree-harness status [name]
  ./bin/worktree-harness logs <name> [app|storybook|all]
  ./bin/worktree-harness inspect <name>
  ./bin/worktree-harness observe <name> [traces|metrics|all]

Notes:
  - metadata, logs, and process state live under the shared git common dir
  - logs prints the most recent harness log lines for a worktree target
  - inspect prints a JSON snapshot for agents (branch, path, envSource, observability paths, pid, logPath, startedAt)
  - observe prints recent traces and aggregated metric samples for a worktree
  - create installs dependencies locally by default to keep worktrees isolated
  - --link-node-modules is opt-in because some runtimes reject shared node_modules symlinks
  - the default host is 127.0.0.1, while app/storybook ports are allocated per worktree
  - pass --host only when you already manage a custom loopback alias or other bindable host`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
