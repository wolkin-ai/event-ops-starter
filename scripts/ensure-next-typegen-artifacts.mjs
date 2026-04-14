import { access, mkdir, rm, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';

const requiredTypeArtifacts = ['.next/types/cache-life.d.ts'];

await rm(path.resolve(process.cwd(), '.next/dev/types'), {
  recursive: true,
  force: true,
});

for (const relativePath of requiredTypeArtifacts) {
  const filePath = path.resolve(process.cwd(), relativePath);

  try {
    await access(filePath, constants.F_OK);
  } catch {
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(
      filePath,
      '// Filled in for deterministic Next.js typecheck when cacheLife is unused.\n',
      'utf8',
    );
  }
}
