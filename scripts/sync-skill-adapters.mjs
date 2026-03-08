import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { coreSkills } from './skill-registry.mjs';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, '..');
const adapterRoot = path.join(repoRoot, '.claude', 'skills');

function buildAdapterBody(entryName, canonicalName, description) {
  const relativePath = path.relative(
    path.join(adapterRoot, entryName),
    path.join(repoRoot, 'skills', 'core', canonicalName, 'SKILL.md'),
  );

  return `---
name: ${entryName}
description: ${description}
---

## Purpose

この adapter は Claude 系エージェントから project-local skill を呼ぶための入口です。

## Use When

- \`${entryName}\` が指定されたとき
- project-local skill を Claude adapter から解決したいとき

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

async function main() {
  await mkdir(adapterRoot, { recursive: true });

  for (const skill of coreSkills) {
    const names = [skill.name, ...skill.aliases];

    for (const entryName of names) {
      const dirPath = path.join(adapterRoot, entryName);
      await mkdir(dirPath, { recursive: true });
      await writeFile(
        path.join(dirPath, 'SKILL.md'),
        buildAdapterBody(entryName, skill.name, skill.description),
        'utf8',
      );
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
