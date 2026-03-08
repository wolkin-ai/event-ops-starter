export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

export interface LogFields {
  readonly [key: string]: unknown;
}

export interface AppLogger {
  debug(message: string, fields?: LogFields): void;
  info(message: string, fields?: LogFields): void;
  warn(message: string, fields?: LogFields): void;
  error(message: string, fields?: LogFields): void;
}

const logLevelWeight: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 50,
};

function normalizeLogLevel(value: string | undefined): LogLevel | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (
    normalized === 'debug' ||
    normalized === 'info' ||
    normalized === 'warn' ||
    normalized === 'error' ||
    normalized === 'silent'
  ) {
    return normalized;
  }

  return null;
}

function resolveLogLevel(): LogLevel {
  const configured = normalizeLogLevel(process.env.LOG_LEVEL);

  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true') {
    return 'silent';
  }

  if (process.env.CI === 'true') {
    return 'warn';
  }

  return 'info';
}

function emitLog(
  level: Exclude<LogLevel, 'silent'>,
  scope: string,
  baseFields: LogFields,
  message: string,
  fields: LogFields | undefined,
) {
  if (logLevelWeight[level] < logLevelWeight[resolveLogLevel()]) {
    return;
  }

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    scope,
    message,
    ...baseFields,
    ...(fields ?? {}),
  };

  const serialized = JSON.stringify(entry);

  if (level === 'error') {
    console.error(serialized);
    return;
  }

  if (level === 'warn') {
    console.warn(serialized);
    return;
  }

  console.log(serialized);
}

export function createLogger(
  scope: string,
  baseFields: LogFields = {},
): AppLogger {
  return {
    debug(message, fields) {
      emitLog('debug', scope, baseFields, message, fields);
    },
    info(message, fields) {
      emitLog('info', scope, baseFields, message, fields);
    },
    warn(message, fields) {
      emitLog('warn', scope, baseFields, message, fields);
    },
    error(message, fields) {
      emitLog('error', scope, baseFields, message, fields);
    },
  };
}
