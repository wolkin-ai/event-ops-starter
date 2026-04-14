import process from 'node:process';

import {
  buildRequiredEnvCheck,
  formatFailure,
  parseArgs,
  readBooleanArg,
  resolveBaseUrl,
  resolveTargetEnv,
  runConfiguredStep,
} from './check-helpers.mjs';
import {
  buildReadinessStatuses,
  printReadinessReport,
  summarizePendingStatuses,
  validateReadinessConfig,
} from './observability-readiness.mjs';

function isRedirectStatus(status) {
  return status >= 300 && status < 400;
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isNonEmptyStringArray(value) {
  return Array.isArray(value) && value.every(isNonEmptyString);
}

function assertTextPresent(body, expectedText, pathname) {
  if (!body.includes(expectedText)) {
    throw new Error(
      `Expected "${expectedText}" in the response for ${pathname}.`,
    );
  }
}

async function fetchWithManualRedirect(baseUrl, pathname) {
  return fetch(new URL(pathname, baseUrl), {
    redirect: 'manual',
  });
}

function buildHeader(config, baseUrl, targetEnv, env, strictObservability) {
  const header = {
    title: config.title,
    baseUrl,
    targetEnv,
    strictObservability,
  };

  if (env.VERCEL_PROJECT_PRODUCTION_URL?.trim()) {
    header.productionUrl = `https://${env.VERCEL_PROJECT_PRODUCTION_URL.trim()}`;
  }

  if (env.VERCEL_BRANCH_URL?.trim()) {
    header.branchUrl = `https://${env.VERCEL_BRANCH_URL.trim()}`;
  }

  if (config.expectedCallbackPath) {
    header.expectedCallback = `${baseUrl}${config.expectedCallbackPath}`;
  }

  return header;
}

function printHeader(header) {
  console.log(header.title);
  console.log(`- base_url: ${header.baseUrl}`);
  console.log(`- target_env: ${header.targetEnv}`);

  if (header.productionUrl) {
    console.log(`- production_url: ${header.productionUrl}`);
  }

  if (header.branchUrl) {
    console.log(`- branch_url: ${header.branchUrl}`);
  }

  if (header.expectedCallback) {
    console.log(`- expected_callback: ${header.expectedCallback}`);
  }
}

function assertEnvChecksReady(envChecks) {
  const missing = envChecks.filter((check) => !check.ready);

  if (missing.length > 0) {
    throw new Error(
      `Missing required envs for rehearsal: ${missing.map((check) => check.id).join(', ')}`,
    );
  }
}

function printEnvChecks(envChecks) {
  for (const check of envChecks) {
    console.log(`- env:${check.id}: ${check.ready ? 'ready' : 'missing'}`);
    console.log(`  ${check.detail}`);
  }
}

async function runPreflightSteps(steps, options) {
  const statuses = [];

  for (const step of steps) {
    if (!options.asJson) {
      console.log(`- ${step.label}: running`);
    }

    const result = await runConfiguredStep(step, {
      cwd: options.cwd,
      env: options.env,
      captureOutput: options.asJson,
    });

    statuses.push({
      id: step.label,
      ready: true,
      detail: `${step.summaryLabel ?? step.label} succeeded.`,
      stdout: result.stdout || undefined,
      stderr: result.stderr || undefined,
    });
  }

  return statuses;
}

function runObservabilitySection(
  config,
  env,
  strictObservability,
  options = {},
) {
  if (!config) {
    return null;
  }

  const statuses = buildReadinessStatuses(config.checks, env);
  const pending = summarizePendingStatuses(statuses);

  if (!options.asJson) {
    console.log(`- ${config.sectionLabel ?? 'observability'}: running`);
    printReadinessReport(config.title, statuses);
  }

  if (strictObservability && pending.length > 0) {
    throw new Error(
      `Strict observability mode failed because these items are pending: ${pending.join(', ')}`,
    );
  }

  return {
    sectionLabel: config.sectionLabel ?? 'observability',
    title: config.title,
    statuses,
    pending,
  };
}

async function runRouteChecks(baseUrl, routes, options = {}) {
  const statuses = [];

  for (const route of routes) {
    const response = await fetchWithManualRedirect(baseUrl, route.path);

    if (isRedirectStatus(response.status)) {
      if (!route.whenRedirect) {
        throw new Error(
          `${route.path} redirected but no redirect expectation was defined.`,
        );
      }

      const location = response.headers.get('location') ?? '';

      if (
        route.whenRedirect.locationIncludesAny &&
        !route.whenRedirect.locationIncludesAny.some((fragment) =>
          location.includes(fragment),
        )
      ) {
        throw new Error(
          `${route.path} redirected to an unexpected location: ${location}`,
        );
      }

      const status = {
        path: route.path,
        ready: true,
        mode: 'redirected',
        status: response.status,
        location,
        detail: `redirected -> ${location}`,
      };
      statuses.push(status);

      if (!options.asJson) {
        console.log(`- route:${route.path}: ${status.detail}`);
      }

      continue;
    }

    if (!route.whenRendered) {
      throw new Error(
        `${route.path} rendered but no render expectation was defined.`,
      );
    }

    if (
      route.whenRendered.status &&
      response.status !== route.whenRendered.status
    ) {
      throw new Error(
        `${route.path} returned an unexpected status: expected=${route.whenRendered.status} actual=${response.status}`,
      );
    }

    if (!response.ok) {
      throw new Error(`${route.path} request failed with ${response.status}.`);
    }

    const body = await response.text();

    for (const expectedText of route.whenRendered.bodyIncludes ?? []) {
      assertTextPresent(body, expectedText, route.path);
    }

    const status = {
      path: route.path,
      ready: true,
      mode: 'rendered',
      status: response.status,
      detail: route.whenRendered.successLabel ?? 'rendered',
    };
    statuses.push(status);

    if (!options.asJson) {
      console.log(`- route:${route.path}: ${status.detail}`);
    }
  }

  return statuses;
}

function buildSummary(preflightSteps, observabilityResult, routeStatuses) {
  if (!observabilityResult) {
    return {
      appRoutes: {
        ready: true,
        checked: routeStatuses.length,
      },
      preflight: preflightSteps.map((step) => ({
        id: step.id,
        ready: step.ready,
      })),
      observability: {
        status: 'not-configured',
        ready: null,
        pending: [],
      },
    };
  }

  return {
    appRoutes: {
      ready: true,
      checked: routeStatuses.length,
    },
    preflight: preflightSteps.map((step) => ({
      id: step.id,
      ready: step.ready,
    })),
    observability: {
      status: observabilityResult.pending.length === 0 ? 'ready' : 'pending',
      ready: observabilityResult.pending.length === 0,
      pending: observabilityResult.pending,
    },
  };
}

function printFinalSummary(summary) {
  console.log('Rehearsal summary');
  console.log('- app routes: ready');

  for (const step of summary.preflight) {
    console.log(`- ${step.id}: ready`);
  }

  if (summary.observability.status === 'not-configured') {
    console.log('- observability: not-configured');
    return;
  }

  console.log(
    `- observability: ${
      summary.observability.ready
        ? 'ready'
        : `pending (${summary.observability.pending.join(', ')})`
    }`,
  );
}

function printHelp() {
  console.log(`Usage:
  node scripts/check/preview-rehearsal.mjs --base-url https://<target-domain>

Options:
  --base-url <url>              Target app base URL.
  --strict-observability <bool> Fail when any observability readiness item is pending.
  --json                        Print machine-readable output.
  --help                        Show this help.`);
}

export function validatePreviewRehearsalConfig(config) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('Preview rehearsal config must be an object.');
  }

  if (!isNonEmptyString(config.title)) {
    throw new Error('Preview rehearsal config.title is required.');
  }

  if (!isNonEmptyString(config.failurePrefix)) {
    throw new Error('Preview rehearsal config.failurePrefix is required.');
  }

  if (
    config.expectedCallbackPath != null &&
    (!isNonEmptyString(config.expectedCallbackPath) ||
      !config.expectedCallbackPath.startsWith('/'))
  ) {
    throw new Error(
      'Preview rehearsal config.expectedCallbackPath must start with "/".',
    );
  }

  if (
    config.requiredEnvNames != null &&
    !Array.isArray(config.requiredEnvNames)
  ) {
    throw new Error(
      'Preview rehearsal config.requiredEnvNames must be an array.',
    );
  }

  for (const name of config.requiredEnvNames ?? []) {
    if (!isNonEmptyString(name)) {
      throw new Error(
        'Preview rehearsal config.requiredEnvNames contains an invalid value.',
      );
    }
  }

  for (const step of config.preflightSteps ?? []) {
    if (!step || typeof step !== 'object' || Array.isArray(step)) {
      throw new Error('Preview rehearsal preflight steps must be objects.');
    }

    if (!isNonEmptyString(step.label)) {
      throw new Error('Preview rehearsal preflight step.label is required.');
    }

    if (!isNonEmptyString(step.script) && !isNonEmptyString(step.command)) {
      throw new Error(
        `Preview rehearsal preflight step "${step.label}" must define script or command.`,
      );
    }

    if (step.args != null && !Array.isArray(step.args)) {
      throw new Error(
        `Preview rehearsal preflight step "${step.label}" args must be an array.`,
      );
    }

    for (const arg of step.args ?? []) {
      if (!isNonEmptyString(arg)) {
        throw new Error(
          `Preview rehearsal preflight step "${step.label}" args contain an invalid value.`,
        );
      }
    }
  }

  if (config.observability) {
    validateReadinessConfig(config.observability);
  }

  if (!Array.isArray(config.routes) || config.routes.length === 0) {
    throw new Error(
      'Preview rehearsal config.routes must contain at least one item.',
    );
  }

  for (const route of config.routes) {
    if (!route || typeof route !== 'object' || Array.isArray(route)) {
      throw new Error('Preview rehearsal routes must be objects.');
    }

    if (!isNonEmptyString(route.path) || !route.path.startsWith('/')) {
      throw new Error('Preview rehearsal route.path must start with "/".');
    }

    if (!route.whenRendered && !route.whenRedirect) {
      throw new Error(
        `Preview rehearsal route "${route.path}" must define whenRendered or whenRedirect.`,
      );
    }

    if (route.whenRedirect?.locationIncludesAny != null) {
      if (!isNonEmptyStringArray(route.whenRedirect.locationIncludesAny)) {
        throw new Error(
          `Preview rehearsal route "${route.path}" has an invalid redirect expectation.`,
        );
      }
    }

    if (route.whenRendered) {
      const hasStatus = Number.isInteger(route.whenRendered.status);
      const hasBodyIncludes =
        route.whenRendered.bodyIncludes != null &&
        isNonEmptyStringArray(route.whenRendered.bodyIncludes);

      if (
        route.whenRendered.bodyIncludes != null &&
        !isNonEmptyStringArray(route.whenRendered.bodyIncludes)
      ) {
        throw new Error(
          `Preview rehearsal route "${route.path}" has an invalid bodyIncludes expectation.`,
        );
      }

      if (
        route.whenRendered.successLabel != null &&
        !isNonEmptyString(route.whenRendered.successLabel)
      ) {
        throw new Error(
          `Preview rehearsal route "${route.path}" has an invalid successLabel.`,
        );
      }

      if (!hasStatus && !hasBodyIncludes) {
        throw new Error(
          `Preview rehearsal route "${route.path}" whenRendered must declare status or bodyIncludes.`,
        );
      }
    }
  }
}

export async function runPreviewRehearsal(config, options = {}) {
  const argv = options.argv ?? process.argv.slice(2);
  const env = options.env ?? process.env;
  const asJson = argv.includes('--json');

  if (argv.includes('--help')) {
    printHelp();
    return;
  }

  const args = parseArgs(argv);
  validatePreviewRehearsalConfig(config);
  const baseUrl = resolveBaseUrl(args['base-url'], env);
  const targetEnv = resolveTargetEnv(baseUrl, env);
  const strictObservability = readBooleanArg(
    args['strict-observability'],
    false,
  );
  const header = buildHeader(
    config,
    baseUrl,
    targetEnv,
    env,
    strictObservability,
  );
  const envChecks = (config.requiredEnvNames ?? []).map((name) =>
    buildRequiredEnvCheck(name, env),
  );
  const preflightSteps = config.preflightSteps ?? [];
  const result = {
    ok: false,
    ...header,
    envChecks,
    preflightSteps: [],
    observability: null,
    routes: [],
    summary: null,
  };

  try {
    if (!asJson) {
      printHeader(header);
      printEnvChecks(envChecks);
    }

    assertEnvChecksReady(envChecks);
    result.preflightSteps = await runPreflightSteps(preflightSteps, {
      cwd: options.cwd ?? process.cwd(),
      env,
      asJson,
    });
    result.observability = runObservabilitySection(
      config.observability,
      env,
      strictObservability,
      { asJson },
    );
    result.routes = await runRouteChecks(baseUrl, config.routes, { asJson });
    result.summary = buildSummary(
      result.preflightSteps,
      result.observability,
      result.routes,
    );
    result.ok = true;

    if (asJson) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      printFinalSummary(result.summary);
    }
  } catch (error) {
    result.error = formatFailure(config.failurePrefix, error);
    if (asJson) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.error(result.error);
    }
    process.exitCode = 1;
  }

  return result;
}
