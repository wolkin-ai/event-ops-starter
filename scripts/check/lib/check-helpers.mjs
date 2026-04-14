import { spawn } from 'node:child_process';
import process from 'node:process';

export function parseArgs(tokens) {
  const parsed = {};

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];

    if (!token.startsWith('--')) {
      continue;
    }

    const key = token.slice(2);
    const next = tokens[index + 1];

    if (!next || next.startsWith('--')) {
      parsed[key] = 'true';
      continue;
    }

    parsed[key] = next;
    index += 1;
  }

  return parsed;
}

export function readBooleanArg(value, fallback) {
  if (value == null) {
    return fallback;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  throw new Error(`boolean argument is invalid: ${value}`);
}

export function resolveBaseUrl(raw, env = process.env) {
  const candidate =
    raw?.trim() ||
    env.BASE_URL?.trim() ||
    env.NEXT_PUBLIC_APP_URL?.trim() ||
    (env.VERCEL_URL?.trim() ? `https://${env.VERCEL_URL.trim()}` : undefined);

  if (!candidate) {
    throw new Error(
      'Set --base-url or BASE_URL / NEXT_PUBLIC_APP_URL / VERCEL_URL.',
    );
  }

  return candidate.endsWith('/') ? candidate.slice(0, -1) : candidate;
}

export function resolveTargetEnv(baseUrl, env = process.env) {
  const fromVercel = env.VERCEL_TARGET_ENV?.trim();

  if (fromVercel) {
    return fromVercel;
  }

  try {
    const url = new URL(baseUrl);

    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      return 'development';
    }

    if (url.hostname.endsWith('.vercel.app')) {
      return 'preview';
    }
  } catch {
    return 'unknown';
  }

  return 'production';
}

export function buildRequiredEnvCheck(name, env = process.env) {
  const value = env[name]?.trim();

  return {
    id: name,
    ready: Boolean(value),
    detail: value ? `${name} is set.` : `${name} is missing.`,
  };
}

export async function runConfiguredStep(step, options = {}) {
  const cwd = options.cwd ?? process.cwd();
  const env = options.env ?? process.env;
  const captureOutput = options.captureOutput ?? false;
  const command = step.command ?? process.execPath;
  const args = step.script
    ? [step.script, ...(step.args ?? [])]
    : (step.args ?? []);

  return await new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    const child = spawn(command, args, {
      cwd,
      env,
      stdio: captureOutput ? ['ignore', 'pipe', 'pipe'] : 'inherit',
      shell: process.platform === 'win32' && command !== process.execPath,
    });

    if (captureOutput) {
      child.stdout?.on('data', (chunk) => {
        stdout += chunk.toString();
      });
      child.stderr?.on('data', (chunk) => {
        stderr += chunk.toString();
      });
    }

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve({
          code,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
        });
        return;
      }

      const error = new Error(
        `${step.label} exited with code ${code ?? 'null'}.`,
      );
      error.code = code;
      error.stdout = stdout.trim();
      error.stderr = stderr.trim();
      reject(error);
    });
  });
}

export function formatFailure(prefix, error) {
  if (error instanceof Error) {
    return `${prefix}: ${error.message}`;
  }

  return `${prefix}: ${String(error)}`;
}
