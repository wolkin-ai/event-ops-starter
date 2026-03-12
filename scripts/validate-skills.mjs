import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  adapterTargets,
  resolveAdapterRoot,
} from './skill-adapter-targets.mjs';
import { coreSkills, requiredSections } from './skill-registry.mjs';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, '..');
const skillRoot = path.join(repoRoot, 'skills', 'core');
const absolutePathPattern = /\/Users\/|~\/\.|[A-Z]:\\/;

async function readSkillBody(filePath) {
  return readFile(filePath, 'utf8');
}

async function assertExists(filePath) {
  await stat(filePath);
}

async function validateCoreSkill(skill) {
  const skillPath = path.join(skillRoot, skill.name, 'SKILL.md');
  await assertExists(skillPath);
  const body = await readSkillBody(skillPath);

  if (!body.startsWith('---\nname: ')) {
    throw new Error(`${skill.name}: missing YAML frontmatter.`);
  }

  if (!new RegExp(`name: ${skill.name}\\n`).test(body)) {
    throw new Error(`${skill.name}: frontmatter name mismatch.`);
  }

  if (!/description: .+/.test(body)) {
    throw new Error(`${skill.name}: missing description.`);
  }

  if (absolutePathPattern.test(body)) {
    throw new Error(`${skill.name}: absolute path or home reference detected.`);
  }

  for (const section of requiredSections) {
    if (!body.includes(`## ${section}`)) {
      throw new Error(`${skill.name}: missing section "${section}".`);
    }
  }
}

async function validateAdapters(target, skill) {
  const adapterRoot = resolveAdapterRoot(repoRoot, target);

  for (const alias of [skill.name, ...skill.aliases]) {
    const adapterPath = path.join(adapterRoot, alias, 'SKILL.md');
    await assertExists(adapterPath);
    const body = await readSkillBody(adapterPath);

    if (!body.includes(`name: ${alias}`)) {
      throw new Error(`${alias}: adapter frontmatter mismatch.`);
    }

    if (!body.includes(`Canonical skill:`)) {
      throw new Error(`${alias}: adapter must reference canonical skill.`);
    }

    if (!body.includes(target.agentLabel)) {
      throw new Error(
        `${alias}: adapter target label mismatch for ${target.name}.`,
      );
    }

    if (!body.includes(target.adapterLabel)) {
      throw new Error(
        `${alias}: adapter resolver label mismatch for ${target.name}.`,
      );
    }

    if (absolutePathPattern.test(body)) {
      throw new Error(`${alias}: adapter contains absolute or external path.`);
    }
  }
}

async function validateNoUnknownAdapters(target) {
  const adapterRoot = resolveAdapterRoot(repoRoot, target);
  const entries = await readdir(adapterRoot, { withFileTypes: true });
  const known = new Set(
    coreSkills.flatMap((skill) => [skill.name, ...skill.aliases]),
  );

  for (const entry of entries) {
    if (entry.isDirectory() && !known.has(entry.name)) {
      throw new Error(
        `Unknown ${target.name} adapter directory found: ${entry.name}`,
      );
    }
  }
}

async function main() {
  for (const skill of coreSkills) {
    if (!/^[a-z0-9-]+$/.test(skill.name)) {
      throw new Error(
        `${skill.name}: canonical skill name must be hyphen-case English.`,
      );
    }

    for (const alias of skill.aliases) {
      if (!/^[a-z0-9-]+$/.test(alias)) {
        throw new Error(
          `${skill.name}: alias "${alias}" must be hyphen-case English.`,
        );
      }
    }

    await validateCoreSkill(skill);

    for (const target of adapterTargets) {
      await validateAdapters(target, skill);
    }
  }

  for (const target of adapterTargets) {
    await validateNoUnknownAdapters(target);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
