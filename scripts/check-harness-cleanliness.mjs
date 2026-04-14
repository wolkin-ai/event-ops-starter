import { access, mkdir, writeFile } from 'node:fs/promises';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, '..');

const requiredDocs = [
  'docs/process/harness-engineering-gap-checklist.md',
  'docs/process/quality-score.md',
  'docs/process/tech-debt-tracker.md',
  'docs/process/infrastructure-continuity.md',
  'docs/process/local-provider-checks.md',
  'docs/process/local-observability.md',
  'docs/process/parallel-agent-worktrees.md',
  'docs/process/starting-a-new-project.md',
];

const forbiddenTrackedPaths = [
  'src/stories/assets',
  'public/file.svg',
  'public/globe.svg',
  'public/next.svg',
  'public/vercel.svg',
  'public/window.svg',
  'docs/reports/generated',
];

function parseArgs(argv) {
  const options = {
    writePatch: null,
    writeReport: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === '--write-patch') {
      const outputPath = argv[index + 1];
      if (!outputPath) {
        throw new Error('Missing value for --write-patch');
      }

      options.writePatch = outputPath;
      index += 1;
      continue;
    }

    if (argument === '--write-report') {
      const outputPath = argv[index + 1];
      if (!outputPath) {
        throw new Error('Missing value for --write-report');
      }

      options.writeReport = outputPath;
      index += 1;
      continue;
    }

    if (argument === '--help') {
      console.log(
        'Usage: node scripts/check-harness-cleanliness.mjs [--write-patch <path>] [--write-report <path>]',
      );
      process.exitCode = 0;
      return null;
    }

    throw new Error(`Unknown argument: ${argument}`);
  }

  return options;
}

function resolveOutputPath(outputPath) {
  return path.isAbsolute(outputPath)
    ? outputPath
    : path.join(repoRoot, outputPath);
}

async function writeOutput(outputPath, content) {
  const resolvedPath = resolveOutputPath(outputPath);
  await mkdir(path.dirname(resolvedPath), { recursive: true });
  await writeFile(resolvedPath, content, 'utf8');
}

function collectTrackedArtifacts() {
  const trackedArtifacts = execFileSync(
    'git',
    ['ls-files', '--', ...forbiddenTrackedPaths],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    },
  )
    .trim()
    .split('\n')
    .filter(Boolean);

  return trackedArtifacts.filter((filePath) =>
    fs.existsSync(path.join(repoRoot, filePath)),
  );
}

function createTrackedArtifactPatch(relativePath) {
  try {
    return execFileSync(
      'git',
      [
        'diff',
        '--no-index',
        '--binary',
        '--src-prefix=a/',
        '--dst-prefix=b/',
        '--',
        relativePath,
        '/dev/null',
      ],
      {
        cwd: repoRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );
  } catch (error) {
    if (
      error instanceof Error &&
      'status' in error &&
      error.status === 1 &&
      'stdout' in error &&
      typeof error.stdout === 'string'
    ) {
      return error.stdout;
    }

    throw error;
  }
}

function renderReport(issues, options) {
  const patchablePaths = issues.flatMap((issue) => issue.patchablePaths ?? []);
  const manualIssues = issues.filter(
    (issue) =>
      patchablePaths.length === 0 || issue.kind !== 'tracked-artifacts',
  );
  const lines = [
    '# Harness cleanup drift report',
    '',
    `Generated at: ${new Date().toISOString()}`,
    '',
  ];

  if (issues.length === 0) {
    lines.push('No cleanup drift detected.');
    return `${lines.join('\n')}\n`;
  }

  lines.push(`Total issues: ${issues.length}`);
  lines.push(`Patch-ready removals: ${patchablePaths.length}`);
  lines.push(`Manual follow-up items: ${manualIssues.length}`);
  lines.push('');
  lines.push('## Findings');
  lines.push('');

  for (const issue of issues) {
    lines.push(`- ${issue.message}`);
  }

  lines.push('');
  lines.push('## Next steps');
  lines.push('');

  if (patchablePaths.length > 0) {
    if (options.writePatch) {
      lines.push('1. Review the suggested removal patch artifact.');
      lines.push(
        '2. Apply it manually if appropriate: `git apply <downloaded-patch-file>`.',
      );
      lines.push('3. Re-run `npm run cleanup:check` before merging.');
    } else {
      lines.push(
        '1. Re-run the script with `--write-patch <path>` to prepare a suggested removal patch.',
      );
      lines.push('2. Apply the patch manually after review.');
      lines.push('3. Re-run `npm run cleanup:check` before merging.');
    }
  } else {
    lines.push(
      '1. No patch was generated because the current drift requires manual edits.',
    );
    lines.push(
      '2. Restore the missing required docs, then re-run `npm run cleanup:check`.',
    );
  }

  if (manualIssues.length > 0) {
    lines.push(
      `${patchablePaths.length > 0 ? '4' : '3'}. Restore any missing required docs manually.`,
    );
    lines.push('');
    lines.push(
      'Missing required docs are reported only; the cleanup script does not invent document content.',
    );
  }

  return `${lines.join('\n')}\n`;
}

function buildPatch(issues) {
  const patchablePaths = issues.flatMap((issue) => issue.patchablePaths ?? []);
  return patchablePaths.map(createTrackedArtifactPatch).join('\n');
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options === null) {
    return;
  }

  const issues = [];

  for (const relativePath of requiredDocs) {
    try {
      await access(path.join(repoRoot, relativePath));
    } catch {
      issues.push({
        kind: 'missing-doc',
        message: `Missing required harness document: ${relativePath}`,
      });
    }
  }

  const existingTrackedArtifacts = collectTrackedArtifacts();

  if (existingTrackedArtifacts.length > 0) {
    issues.push({
      kind: 'tracked-artifacts',
      message: `Tracked sample or generated artifacts must be removed: ${existingTrackedArtifacts.join(', ')}`,
      patchablePaths: existingTrackedArtifacts,
    });
  }

  if (options.writePatch) {
    const patch = buildPatch(issues);
    if (patch.length > 0) {
      await writeOutput(options.writePatch, patch);
    }
  }

  if (options.writeReport) {
    await writeOutput(options.writeReport, renderReport(issues, options));
  }

  if (issues.length > 0) {
    for (const issue of issues) {
      console.error(issue.message);
    }

    process.exitCode = 1;
    return;
  }

  console.log('Harness cleanup check passed.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
