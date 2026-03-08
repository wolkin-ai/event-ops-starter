import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, '..');
const reportsDir = path.join(repoRoot, 'docs', 'reports', 'generated');
const schemaPath = path.join(currentDir, 'review-output-schema.json');

const promptMap = {
  architecture: path.join(
    repoRoot,
    'docs',
    'codex-agents',
    'architecture-specialist.md',
  ),
  security: path.join(
    repoRoot,
    'docs',
    'codex-agents',
    'security-specialist.md',
  ),
  performance: path.join(
    repoRoot,
    'docs',
    'codex-agents',
    'performance-specialist.md',
  ),
  investigate: path.join(
    repoRoot,
    'docs',
    'codex-agents',
    'investigate-specialist.md',
  ),
};

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function createFallbackReport(type, targetPaths, error) {
  return {
    reviewType: type,
    targetPaths,
    summary: `Codex execution skipped. ${error instanceof Error ? error.message : 'Fallback report created.'}`,
    blocking: false,
    findings: [],
  };
}

function renderMarkdown(report) {
  const lines = [
    `# ${report.reviewType} review`,
    '',
    `- targets: ${report.targetPaths.join(', ')}`,
    `- blocking: ${report.blocking ? 'true' : 'false'}`,
    '',
    report.summary,
    '',
    '## Findings',
  ];

  if (report.findings.length === 0) {
    lines.push('', '- none');
  } else {
    for (const finding of report.findings) {
      lines.push(
        '',
        `- [${finding.severity}] ${finding.file}${finding.line ? `:${finding.line}` : ''} ${finding.summary}`,
      );
    }
  }

  return `${lines.join('\n')}\n`;
}

async function main() {
  const [rawType, ...targets] = process.argv.slice(2);
  const type = rawType ?? 'architecture';
  const targetPaths = targets.length > 0 ? targets : ['src'];
  const promptFile = promptMap[type];

  if (!promptFile) {
    throw new Error(`Unknown review type: ${type}`);
  }

  await mkdir(reportsDir, { recursive: true });

  const promptTemplate = await readFile(promptFile, 'utf8');
  const prompt = `${promptTemplate}\n\nTarget paths:\n${targetPaths.map((target) => `- ${target}`).join('\n')}\n`;
  const baseName = `${timestamp()}-${type}`;
  const jsonPath = path.join(reportsDir, `${baseName}.json`);
  const markdownPath = path.join(reportsDir, `${baseName}.md`);
  const tempOutputPath = path.join(reportsDir, `${baseName}.tmp.json`);

  let report;

  if (process.env.CODEX_REVIEW_EXEC === '1') {
    try {
      execFileSync(
        'codex',
        [
          'exec',
          '--dangerously-bypass-approvals-and-sandbox',
          '--skip-git-repo-check',
          '--cd',
          repoRoot,
          '--output-schema',
          schemaPath,
          '-o',
          tempOutputPath,
          prompt,
        ],
        {
          cwd: repoRoot,
          stdio: 'inherit',
        },
      );

      const raw = await readFile(tempOutputPath, 'utf8');
      report = JSON.parse(raw);
    } catch (error) {
      report = createFallbackReport(type, targetPaths, error);
    } finally {
      await unlink(tempOutputPath).catch(() => undefined);
    }
  } else {
    report = {
      reviewType: type,
      targetPaths,
      summary:
        'Prepared project-local review request. Set CODEX_REVIEW_EXEC=1 to invoke the Codex agent.',
      blocking: false,
      findings: [],
    };
  }

  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  await writeFile(markdownPath, renderMarkdown(report), 'utf8');

  console.log(`JSON report: ${jsonPath}`);
  console.log(`Markdown report: ${markdownPath}`);

  if (process.env.REVIEW_FAIL_ON_BLOCKING === '1' && report.blocking === true) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
