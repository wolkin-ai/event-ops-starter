import 'dotenv/config';

import process from 'node:process';

import { Pool } from 'pg';

import { formatFailure, parseArgs } from './check-helpers.mjs';

const FAILURE_PREFIX = 'PostgreSQL check failed';
const REQUIRED_TABLES = ['EventPlan', 'EventPublication', 'Registration'];
const SUPPORTED_MODES = ['status', 'smoke'];

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeMode(value) {
  if (!isNonEmptyString(value)) {
    return 'status';
  }

  if (SUPPORTED_MODES.includes(value)) {
    return value;
  }

  throw new Error(
    `Unsupported mode "${value}". Use one of: ${SUPPORTED_MODES.join(', ')}.`,
  );
}

export function resolvePostgresCheckConfig(args = {}, env = process.env) {
  return {
    databaseUrl: args['database-url']?.trim() || env.DATABASE_URL?.trim() || '',
  };
}

export function validatePostgresCheckConfig(config) {
  if (!isNonEmptyString(config.databaseUrl)) {
    throw new Error('Set --database-url or DATABASE_URL.');
  }

  if (!config.databaseUrl.startsWith('postgresql://')) {
    throw new Error('PostgreSQL check requires a postgresql:// DATABASE_URL.');
  }
}

async function checkConnection(pool) {
  await pool.query('SELECT 1 AS ok');

  return {
    ready: true,
    detail: 'Database connection succeeded.',
  };
}

async function checkSchema(pool) {
  const result = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('EventPlan', 'EventPublication', 'Registration')
    ORDER BY table_name
  `);
  const presentTables = result.rows
    .map((row) => String(row.table_name ?? ''))
    .filter((value) => value.length > 0);
  const missingTables = REQUIRED_TABLES.filter(
    (table) => !presentTables.includes(table),
  );

  return {
    ready: missingTables.length === 0,
    presentTables,
    missingTables,
    detail:
      missingTables.length === 0
        ? 'Required demo tables are present.'
        : `Missing tables: ${missingTables.join(', ')}.`,
  };
}

async function checkSampleData(pool) {
  const result = await pool.query(
    'SELECT COUNT(*)::int AS count FROM "EventPublication"',
  );
  const count = Number(result.rows[0]?.count ?? 0);

  return {
    ready: count > 0,
    publicationCount: count,
    detail:
      count > 0
        ? `Found ${count} publication rows for the demo catalog.`
        : 'EventPublication is empty. Seed data was not imported.',
  };
}

function buildSummary(result) {
  return {
    provider: result.connection?.ready ?? false,
    schema: result.schema?.ready ?? null,
    sampleData: result.sampleData?.ready ?? null,
  };
}

function printHelp() {
  console.log(`Usage:
  node scripts/check/postgres.mjs --mode status

Options:
  --mode <status|smoke>              Run connectivity only or include schema/data checks.
  --database-url <postgresql://...>  Override DATABASE_URL.
  --json                             Print machine-readable output.
  --help                             Show this help.`);
}

function printResult(result) {
  console.log('PostgreSQL provider check');
  console.log(`- mode: ${result.mode}`);

  if (result.connection) {
    console.log(
      `- connection: ${result.connection.ready ? 'ready' : 'failed'} (${result.connection.detail})`,
    );
  }

  if (result.schema) {
    console.log(
      `- schema: ${result.schema.ready ? 'ready' : 'failed'} (${result.schema.detail})`,
    );
  }

  if (result.sampleData) {
    console.log(
      `- sample_data: ${result.sampleData.ready ? 'ready' : 'failed'} (${result.sampleData.detail})`,
    );
  }
}

export async function runPostgresCheck(options = {}) {
  const argv = options.argv ?? process.argv.slice(2);
  const env = options.env ?? process.env;
  const asJson = argv.includes('--json');

  if (argv.includes('--help')) {
    printHelp();
    return;
  }

  const args = parseArgs(argv);
  const mode = normalizeMode(args.mode);
  const config = resolvePostgresCheckConfig(args, env);
  const result = {
    ok: false,
    mode,
    connection: null,
    schema: null,
    sampleData: null,
    summary: null,
  };
  let pool;

  try {
    validatePostgresCheckConfig(config);
    pool = (options.poolFactory ?? ((input) => new Pool(input)))({
      connectionString: config.databaseUrl,
    });
    result.connection = await checkConnection(pool);

    if (mode === 'smoke') {
      result.schema = await checkSchema(pool);

      if (!result.schema.ready) {
        throw new Error(result.schema.detail);
      }

      result.sampleData = await checkSampleData(pool);

      if (!result.sampleData.ready) {
        throw new Error(result.sampleData.detail);
      }
    }

    result.summary = buildSummary(result);
    result.ok = true;

    if (asJson) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      printResult(result);
    }
  } catch (error) {
    result.error = formatFailure(FAILURE_PREFIX, error);

    if (asJson) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.error(result.error);
    }

    process.exitCode = 1;
  } finally {
    await pool?.end?.();
  }

  return result;
}
