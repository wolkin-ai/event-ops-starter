import process from 'node:process';

function readTrimmedEnv(name, env) {
  const value = env[name];

  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function collectValues(names, env) {
  const values = {};

  for (const name of names) {
    values[name] = readTrimmedEnv(name, env);
  }

  return values;
}

function resolveNames(definition) {
  if (definition.allOf) {
    return definition.allOf;
  }

  if (definition.anyOf) {
    return definition.anyOf;
  }

  if (definition.env) {
    return [definition.env];
  }

  return [];
}

function resolveReady(definition, values) {
  if (definition.allOf) {
    return definition.allOf.every((name) => Boolean(values[name]));
  }

  if (definition.anyOf) {
    return definition.anyOf.some((name) => Boolean(values[name]));
  }

  if (definition.env) {
    return Boolean(values[definition.env]);
  }

  return false;
}

function resolveValidationState(definition, context) {
  if (typeof definition.validate !== 'function') {
    return {
      ready: true,
      detailKey: 'readyDetail',
    };
  }

  if (definition.validate(context)) {
    return {
      ready: true,
      detailKey: 'readyDetail',
    };
  }

  return {
    ready: false,
    detailKey: 'invalidDetail',
  };
}

function resolveDetail(message, context) {
  if (typeof message === 'function') {
    return message(context);
  }

  return message;
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isNonEmptyStringArray(value) {
  return (
    Array.isArray(value) && value.length > 0 && value.every(isNonEmptyString)
  );
}

function countDefinedSelectors(definition) {
  return ['env', 'anyOf', 'allOf'].filter((key) => definition[key] != null)
    .length;
}

export function validateReadinessConfig(config) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('Observability config must be an object.');
  }

  if (!isNonEmptyString(config.title)) {
    throw new Error('Observability config.title is required.');
  }

  if (!Array.isArray(config.checks) || config.checks.length === 0) {
    throw new Error(
      'Observability config.checks must contain at least one item.',
    );
  }

  for (const definition of config.checks) {
    if (
      !definition ||
      typeof definition !== 'object' ||
      Array.isArray(definition)
    ) {
      throw new Error('Observability check definitions must be objects.');
    }

    if (!isNonEmptyString(definition.id)) {
      throw new Error('Observability check.id is required.');
    }

    if (countDefinedSelectors(definition) !== 1) {
      throw new Error(
        `Observability check "${definition.id}" must declare exactly one of env / anyOf / allOf.`,
      );
    }

    if (definition.env != null && !isNonEmptyString(definition.env)) {
      throw new Error(
        `Observability check "${definition.id}" has an invalid env value.`,
      );
    }

    if (definition.anyOf != null && !isNonEmptyStringArray(definition.anyOf)) {
      throw new Error(
        `Observability check "${definition.id}" has an invalid anyOf value.`,
      );
    }

    if (definition.allOf != null && !isNonEmptyStringArray(definition.allOf)) {
      throw new Error(
        `Observability check "${definition.id}" has an invalid allOf value.`,
      );
    }

    if (
      !['string', 'function'].includes(typeof definition.readyDetail) ||
      !['string', 'function'].includes(typeof definition.pendingDetail)
    ) {
      throw new Error(
        `Observability check "${definition.id}" must define readyDetail and pendingDetail.`,
      );
    }

    if (
      definition.invalidDetail != null &&
      !['string', 'function'].includes(typeof definition.invalidDetail)
    ) {
      throw new Error(
        `Observability check "${definition.id}" has an invalid invalidDetail value.`,
      );
    }

    if (
      definition.validate != null &&
      typeof definition.validate !== 'function'
    ) {
      throw new Error(
        `Observability check "${definition.id}" validate must be a function.`,
      );
    }
  }
}

export function buildReadinessStatuses(definitions, env = process.env) {
  return definitions.map((definition) => {
    const names = resolveNames(definition);
    const values = collectValues(names, env);
    const baseReady = resolveReady(definition, values);
    const context = {
      env,
      values,
    };
    const validationState = baseReady
      ? resolveValidationState(definition, context)
      : {
          ready: false,
          detailKey: 'pendingDetail',
        };
    const ready = validationState.ready;
    const detailKey =
      validationState.detailKey === 'invalidDetail' && !definition.invalidDetail
        ? 'pendingDetail'
        : validationState.detailKey;
    const detailContext = {
      ...context,
      ready,
    };

    return {
      id: definition.id,
      ready,
      detail: ready
        ? resolveDetail(definition.readyDetail, detailContext)
        : resolveDetail(definition[detailKey], detailContext),
    };
  });
}

export function printReadinessReport(title, statuses) {
  console.log(title);

  for (const status of statuses) {
    console.log(`- ${status.id}: ${status.ready ? 'ready' : 'pending'}`);
    console.log(`  ${status.detail}`);
  }
}

export function summarizePendingStatuses(statuses) {
  return statuses.filter((status) => !status.ready).map((status) => status.id);
}

export function runObservabilityReadiness(config, options = {}) {
  const argv = options.argv ?? process.argv.slice(2);
  const env = options.env ?? process.env;
  const asJson = argv.includes('--json');
  validateReadinessConfig(config);
  const statuses = buildReadinessStatuses(config.checks, env);

  if (asJson) {
    console.log(JSON.stringify(statuses, null, 2));
    return statuses;
  }

  printReadinessReport(config.title, statuses);
  return statuses;
}
