#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { parseWorktreeListPorcelain } from './worktree-harness-lib.mjs';

async function main() {
  const context = getGitContext();
  const state = await readState(context.stateDir);
  const worktrees = listGitWorktrees(context.currentTopLevel);
  const issues = collectPolicyIssues(state, worktrees, context);

  if (issues.length > 0) {
    for (const issue of issues) {
      console.error(issue);
    }

    process.exitCode = 1;
    return;
  }

  console.log('Worktree ownership policy check passed.');
}

function getGitContext() {
  const cwd = process.cwd();
  const currentTopLevel = path.resolve(
    cwd,
    runGit(cwd, ['rev-parse', '--path-format=absolute', '--show-toplevel']),
  );
  const commonDir = path.resolve(
    cwd,
    runGit(cwd, ['rev-parse', '--path-format=absolute', '--git-common-dir']),
  );

  return {
    currentTopLevel,
    canonicalRoot: path.dirname(commonDir),
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

function listGitWorktrees(cwd) {
  return parseWorktreeListPorcelain(
    runGit(cwd, ['worktree', 'list', '--porcelain']),
  ).map((entry) => ({
    ...entry,
    path: path.resolve(entry.path),
  }));
}

async function readState(stateDir) {
  const statePath = path.join(stateDir, 'state.json');

  if (!fs.existsSync(statePath)) {
    return {};
  }

  return JSON.parse(await fsp.readFile(statePath, 'utf8'));
}

function collectPolicyIssues(state, worktrees, context) {
  const issues = [];
  const worktreesByPath = new Map(
    worktrees.map((entry) => [path.resolve(entry.path), entry]),
  );
  const canonicalBranch =
    worktreesByPath.get(context.canonicalRoot)?.branch ?? null;
  const seenBranches = new Map();
  const seenPaths = new Map();
  const seenEndpoints = new Map();

  for (const [name, record] of Object.entries(state).sort(([left], [right]) =>
    left.localeCompare(right),
  )) {
    if (typeof record !== 'object' || record === null) {
      issues.push(`Managed worktree "${name}" has invalid harness metadata.`);
      continue;
    }

    const branch = normalizeNonEmptyString(record.branch);
    const recordPath = normalizeAbsolutePath(record.path);
    const host = normalizeNonEmptyString(record.host);
    const appPort = normalizePositiveInteger(record.appPort);
    const storybookPort = normalizePositiveInteger(record.storybookPort);

    if (branch === null) {
      issues.push(
        `Managed worktree "${name}" is missing a branch in harness metadata.`,
      );
    }

    if (recordPath === null) {
      issues.push(
        `Managed worktree "${name}" is missing an absolute path in harness metadata.`,
      );
    }

    if (host === null) {
      issues.push(
        `Managed worktree "${name}" is missing a host in harness metadata.`,
      );
    }

    if (appPort === null) {
      issues.push(
        `Managed worktree "${name}" is missing a positive app port in harness metadata.`,
      );
    }

    if (storybookPort === null) {
      issues.push(
        `Managed worktree "${name}" is missing a positive storybook port in harness metadata.`,
      );
    }

    if (recordPath !== null && recordPath === context.canonicalRoot) {
      issues.push(
        `Managed worktree "${name}" points at the canonical root path: ${recordPath}`,
      );
    }

    if (
      branch !== null &&
      canonicalBranch !== null &&
      branch === canonicalBranch
    ) {
      issues.push(
        `Managed worktree "${name}" reuses the canonical root branch: ${branch}`,
      );
    }

    if (recordPath !== null) {
      const linkedWorktree = worktreesByPath.get(recordPath);

      if (!linkedWorktree) {
        issues.push(
          `Managed worktree "${name}" is missing from git worktree list: ${recordPath}`,
        );
      } else if (branch !== null && linkedWorktree.branch !== branch) {
        issues.push(
          `Managed worktree "${name}" branch mismatch. state=${branch} git=${linkedWorktree.branch ?? 'detached'} path=${recordPath}`,
        );
      }
    }

    rememberDuplicate(seenBranches, branch, name, 'branch', issues);
    rememberDuplicate(seenPaths, recordPath, name, 'path', issues);

    if (host !== null && appPort !== null) {
      rememberDuplicate(
        seenEndpoints,
        `${host}:${String(appPort)}`,
        `${name} app`,
        'runtime endpoint',
        issues,
      );
    }

    if (host !== null && storybookPort !== null) {
      rememberDuplicate(
        seenEndpoints,
        `${host}:${String(storybookPort)}`,
        `${name} storybook`,
        'runtime endpoint',
        issues,
      );
    }
  }

  return issues;
}

function normalizeNonEmptyString(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  return normalized === '' ? null : normalized;
}

function normalizeAbsolutePath(value) {
  const normalized = normalizeNonEmptyString(value);

  if (normalized === null || !path.isAbsolute(normalized)) {
    return null;
  }

  return path.resolve(normalized);
}

function normalizePositiveInteger(value) {
  return Number.isInteger(value) && value > 0 ? value : null;
}

function rememberDuplicate(seenValues, value, owner, label, issues) {
  if (value === null) {
    return;
  }

  const existingOwner = seenValues.get(value);

  if (existingOwner !== undefined) {
    issues.push(
      `Managed worktrees "${existingOwner}" and "${owner}" share the same ${label}: ${value}`,
    );
    return;
  }

  seenValues.set(value, owner);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
