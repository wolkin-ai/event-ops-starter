import { execFileSync, spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { reviewPolicies, severityRank } from './review-policy.mjs';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, '..');

function npmCommand() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

function readGitLines(args) {
  try {
    const output = execFileSync('git', args, {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();

    return output === '' ? [] : output.split('\n');
  } catch {
    return [];
  }
}

function detectChangedFiles() {
  const explicitTargets = process.argv.slice(2);

  if (explicitTargets.length > 0) {
    return explicitTargets;
  }

  const workingTreeTargets = [
    ...readGitLines(['diff', '--name-only', 'HEAD']),
    ...readGitLines(['diff', '--name-only', '--cached']),
    ...readGitLines(['ls-files', '--others', '--exclude-standard']),
  ];

  if (workingTreeTargets.length > 0) {
    return [...new Set(workingTreeTargets)];
  }

  if (process.env.GITHUB_BASE_REF) {
    const baseTargets = readGitLines([
      'diff',
      '--name-only',
      `origin/${process.env.GITHUB_BASE_REF}...HEAD`,
    ]);

    if (baseTargets.length > 0) {
      return baseTargets;
    }
  }

  const lastCommitTargets = readGitLines([
    'diff',
    '--name-only',
    'HEAD~1..HEAD',
  ]);

  if (lastCommitTargets.length > 0) {
    return lastCommitTargets;
  }

  return ['src'];
}

function compactTargets(targets, fallbackTargets) {
  const normalized = [...new Set(targets)].filter(Boolean);

  if (normalized.length === 0) {
    return fallbackTargets;
  }

  if (normalized.length > 8) {
    return fallbackTargets;
  }

  return normalized;
}

function reportBreach(policy, report) {
  if (report.blocking === true) {
    return `Codex marked ${policy.type} review as blocking.`;
  }

  const threshold = severityRank[policy.blockingAt];

  for (const finding of report.findings ?? []) {
    const severity = String(finding.severity ?? '').toLowerCase();

    if ((severityRank[severity] ?? -1) >= threshold) {
      return `Found ${severity} severity issue in ${policy.type} review: ${finding.summary}`;
    }
  }

  return null;
}

async function runPolicy(policy, changedFiles) {
  const matchedFiles = changedFiles.filter((filePath) =>
    policy.triggers.some((pattern) => pattern.test(filePath)),
  );

  if (matchedFiles.length === 0 && process.env.FORCE_FULL_REVIEW !== '1') {
    return {
      type: policy.type,
      skipped: true,
    };
  }

  const targets = compactTargets(matchedFiles, policy.defaultTargets);
  const result = spawnSync(
    npmCommand(),
    ['run', `review:${policy.type}`, '--', ...targets],
    {
      cwd: repoRoot,
      env: process.env,
      encoding: 'utf8',
    },
  );

  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);

  if (result.status !== 0) {
    throw new Error(`${policy.type} review command failed.`);
  }

  const jsonLine = result.stdout
    .split('\n')
    .find((line) => line.startsWith('JSON report: '));

  if (!jsonLine) {
    throw new Error(`${policy.type} review did not report a JSON path.`);
  }

  const jsonPath = jsonLine.replace('JSON report: ', '').trim();
  const report = JSON.parse(await readFile(jsonPath, 'utf8'));
  const breach = reportBreach(policy, report);

  return {
    type: policy.type,
    skipped: false,
    targets,
    breach,
  };
}

async function main() {
  const changedFiles = detectChangedFiles();
  const results = [];
  let hasFailure = false;

  for (const policy of reviewPolicies) {
    const result = await runPolicy(policy, changedFiles);
    results.push(result);

    if (!result.skipped && result.breach) {
      hasFailure = true;
      console.error(`Review threshold failed: ${result.breach}`);
    }
  }

  const executed = results.filter((result) => !result.skipped);

  if (executed.length === 0) {
    console.log('No review policies matched the current change set.');
  } else {
    console.log(
      `Executed review policies: ${executed
        .map((result) => `${result.type} (${result.targets.join(', ')})`)
        .join('; ')}`,
    );
  }

  if (hasFailure) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
