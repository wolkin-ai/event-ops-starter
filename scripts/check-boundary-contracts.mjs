import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, '..');
const featuresRoot = path.join(repoRoot, 'src', 'features');

function collectAdapterFiles(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      collectAdapterFiles(fullPath, files);
      continue;
    }

    if (
      fullPath.includes(
        `${path.sep}infrastructure${path.sep}adapters${path.sep}`,
      ) &&
      entry.name.endsWith('.ts')
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

function isContractFile(filePath) {
  return filePath.endsWith('-contract.ts');
}

function isTestFile(filePath) {
  return filePath.endsWith('.test.ts');
}

function hasLocalContractImport(source) {
  return (
    /from ['"]\.\/[^'"]*contract['"]/.test(source) ||
    /from ['"]@\/features\/[^'"]*\/infrastructure\/adapters\/[^'"]*contract['"]/.test(
      source,
    )
  );
}

async function main() {
  const issues = [];
  const adapterFiles = collectAdapterFiles(featuresRoot).filter(
    (filePath) => !isContractFile(filePath) && !isTestFile(filePath),
  );

  for (const filePath of adapterFiles) {
    const relativePath = path.relative(repoRoot, filePath);
    const source = fs.readFileSync(filePath, 'utf8');

    if (/from ['"]zod['"]/.test(source)) {
      issues.push(
        `${relativePath}: adapter implementation must not import zod directly; move schemas into a sibling *-contract.ts file.`,
      );
    }

    if (/from ['"]@\/lib\/event-records['"]/.test(source)) {
      issues.push(
        `${relativePath}: adapter implementation must not import @/lib/event-records directly; wrap boundary parsing/building in a sibling *-contract.ts file.`,
      );
    }

    if (!hasLocalContractImport(source)) {
      issues.push(
        `${relativePath}: adapter implementation must import a sibling or same-slice *-contract.ts module.`,
      );
    }
  }

  if (issues.length > 0) {
    for (const issue of issues) {
      console.error(issue);
    }

    process.exitCode = 1;
    return;
  }

  console.log('Boundary contract check passed.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
