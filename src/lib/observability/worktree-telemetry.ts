import fs from 'node:fs';
import path from 'node:path';

const TRACE_FILE_ENV = 'WORKTREE_TRACE_FILE';
const METRICS_FILE_ENV = 'WORKTREE_METRICS_FILE';

export interface HttpExchangeTelemetry {
  readonly requestId: string;
  readonly route: string;
  readonly method: string;
  readonly status: number;
  readonly durationMs: number;
  readonly code?: string;
}

interface WorktreeTelemetryPaths {
  readonly tracesFile: string;
  readonly metricsFile: string;
}

export function recordHttpExchangeTelemetry(
  exchange: HttpExchangeTelemetry,
  env: NodeJS.ProcessEnv = process.env,
) {
  const paths = resolveWorktreeTelemetryPaths(env);

  if (paths === null) {
    return;
  }

  const timestamp = new Date().toISOString();
  const outcome = deriveOutcome(exchange.status);
  const basePayload = {
    timestamp,
    requestId: exchange.requestId,
    route: exchange.route,
    method: exchange.method,
    status: exchange.status,
    durationMs: exchange.durationMs,
    outcome,
    ...(exchange.code !== undefined ? { code: exchange.code } : {}),
  };

  try {
    appendJsonLine(paths.tracesFile, {
      kind: 'http.request',
      ...basePayload,
    });
    appendJsonLine(paths.metricsFile, {
      kind: 'http.request.metric',
      ...basePayload,
    });
  } catch (error) {
    console.warn(
      JSON.stringify({
        timestamp,
        level: 'warn',
        scope: 'observability.telemetry',
        message: 'telemetry.write.failed',
        errorMessage: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}

function resolveWorktreeTelemetryPaths(
  env: NodeJS.ProcessEnv,
): WorktreeTelemetryPaths | null {
  const tracesFile = normalizeAbsolutePath(env[TRACE_FILE_ENV]);
  const metricsFile = normalizeAbsolutePath(env[METRICS_FILE_ENV]);

  if (tracesFile === null || metricsFile === null) {
    return null;
  }

  return {
    tracesFile,
    metricsFile,
  };
}

function normalizeAbsolutePath(value: string | undefined) {
  if (value === undefined) {
    return null;
  }

  const normalized = value.trim();

  if (normalized === '' || !path.isAbsolute(normalized)) {
    return null;
  }

  return normalized;
}

function deriveOutcome(status: number) {
  if (status >= 500) {
    return 'server_error';
  }

  if (status >= 400) {
    return 'client_error';
  }

  return 'success';
}

function appendJsonLine(filePath: string, payload: object) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, `${JSON.stringify(payload)}\n`, 'utf8');
}
