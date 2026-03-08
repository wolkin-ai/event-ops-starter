import { access } from 'node:fs/promises';
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

async function main() {
  const issues = [];

  for (const relativePath of requiredDocs) {
    try {
      await access(path.join(repoRoot, relativePath));
    } catch {
      issues.push(`Missing required harness document: ${relativePath}`);
    }
  }

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

  const existingTrackedArtifacts = trackedArtifacts.filter((filePath) =>
    fs.existsSync(path.join(repoRoot, filePath)),
  );

  if (existingTrackedArtifacts.length > 0) {
    issues.push(
      `Tracked sample or generated artifacts must be removed: ${existingTrackedArtifacts.join(', ')}`,
    );
  }

  if (issues.length > 0) {
    for (const issue of issues) {
      console.error(issue);
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
