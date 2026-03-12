import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  adapterTargets,
  resolveAdapterRoot,
} from './skill-adapter-targets.mjs';
import { coreSkills } from './skill-registry.mjs';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, '..');

function buildAdapterBody(
  target,
  adapterRoot,
  entryName,
  canonicalName,
  description,
) {
  const relativePath = path.relative(
    path.join(adapterRoot, entryName),
    path.join(repoRoot, 'skills', 'core', canonicalName, 'SKILL.md'),
  );

  return `---
name: ${entryName}
description: ${description}
---

## Purpose

この adapter は ${target.agentLabel}から project-local skill を呼ぶための入口です。

## Use When

- \`${entryName}\` が指定されたとき
- project-local skill を ${target.adapterLabel} から解決したいとき

## Inputs

- 対象タスク
- 必要なら対象ファイルや slice

## Workflow

1. 正本の \`${canonicalName}\` を参照する
2. project-local の手順だけを使う
3. ホーム配下の skill には依存しない

Canonical skill: \`${relativePath}\`

## Output Contract

- 正本 skill の output contract に従う

## Guardrails

- adapter 自体を source of truth にしない
- 絶対パスや home 配下への依存を書かない

## Related Skills

- \`${canonicalName}\`
`;
}

async function writeFileIfChanged(filePath, nextBody) {
  try {
    const currentBody = await readFile(filePath, 'utf8');

    if (currentBody === nextBody) {
      return;
    }
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      throw error;
    }
  }

  const tempPath = `${filePath}.tmp-${process.pid}`;
  await writeFile(tempPath, nextBody, 'utf8');
  await rename(tempPath, filePath);
}

async function main() {
  for (const target of adapterTargets) {
    const adapterRoot = resolveAdapterRoot(repoRoot, target);
    await mkdir(adapterRoot, { recursive: true });

    for (const skill of coreSkills) {
      const names = [skill.name, ...skill.aliases];

      for (const entryName of names) {
        const dirPath = path.join(adapterRoot, entryName);
        await mkdir(dirPath, { recursive: true });
        await writeFileIfChanged(
          path.join(dirPath, 'SKILL.md'),
          buildAdapterBody(
            target,
            adapterRoot,
            entryName,
            skill.name,
            skill.description,
          ),
        );
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
