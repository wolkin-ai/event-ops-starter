import { NextResponse } from 'next/server';
import { ZodError, type ZodType } from 'zod';

import { createLogger, type AppLogger } from '@/lib/observability/logger';

export interface RouteContext {
  readonly requestId: string;
  readonly route: string;
  readonly method: string;
  readonly startedAt: number;
  readonly logger: AppLogger;
}

interface ErrorResponseOptions {
  readonly status: number;
  readonly code: string;
  readonly message: string;
  readonly details?: unknown;
}

interface HandleRouteErrorOptions {
  readonly fallbackMessage: string;
  readonly expectedStatus?: number;
  readonly expectedCode?: string;
}

export class RouteContractError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'RouteContractError';
  }
}

export function createRouteContext(
  request: Request,
  route: string,
): RouteContext {
  const headerRequestId = request.headers.get('x-request-id');
  const requestId =
    headerRequestId !== null && headerRequestId.trim() !== ''
      ? headerRequestId.trim()
      : crypto.randomUUID();

  return {
    requestId,
    route,
    method: request.method,
    startedAt: Date.now(),
    logger: createLogger('http.route', {
      requestId,
      route,
      method: request.method,
    }),
  };
}

export async function readRequestJson<T>(
  request: Request,
  schema: ZodType<T>,
  context: RouteContext,
): Promise<T> {
  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch {
    throw new RouteContractError(
      400,
      'invalid_json',
      'Request body must be valid JSON.',
    );
  }

  const result = schema.safeParse(rawBody);

  if (!result.success) {
    context.logger.warn('request.validation.failed', {
      validation: result.error.flatten(),
    });

    throw new RouteContractError(
      400,
      'invalid_request',
      'Request body validation failed.',
      result.error.flatten(),
    );
  }

  return result.data;
}

export function jsonResponse<T>(
  context: RouteContext,
  schema: ZodType<T>,
  payload: T,
  init?: ResponseInit,
) {
  const result = schema.safeParse(payload);

  if (!result.success) {
    context.logger.error('response.validation.failed', {
      validation: result.error.flatten(),
    });

    throw new RouteContractError(
      500,
      'invalid_response',
      'Route response validation failed.',
      result.error.flatten(),
    );
  }

  const response = NextResponse.json(result.data, init);
  response.headers.set('x-request-id', context.requestId);

  context.logger.info('request.completed', {
    status: response.status,
    durationMs: Date.now() - context.startedAt,
  });

  return response;
}

export function errorResponse(
  context: RouteContext,
  options: ErrorResponseOptions,
) {
  const responseBody: {
    readonly error: string;
    readonly code: string;
    readonly requestId: string;
    readonly details?: unknown;
  } = {
    error: options.message,
    code: options.code,
    requestId: context.requestId,
    ...(options.status < 500 && options.details !== undefined
      ? { details: options.details }
      : {}),
  };

  const response = NextResponse.json(responseBody, {
    status: options.status,
  });

  response.headers.set('x-request-id', context.requestId);

  const logMessage = 'request.failed';
  const logFields = {
    status: options.status,
    code: options.code,
    durationMs: Date.now() - context.startedAt,
    ...(options.details !== undefined ? { details: options.details } : {}),
  };

  if (options.status >= 500) {
    context.logger.error(logMessage, logFields);
  } else {
    context.logger.warn(logMessage, logFields);
  }

  return response;
}

export function handleRouteError(
  context: RouteContext,
  error: unknown,
  options: HandleRouteErrorOptions,
) {
  if (error instanceof RouteContractError) {
    return errorResponse(context, {
      status: error.status,
      code: error.code,
      message: error.message,
      details: error.details,
    });
  }

  if (error instanceof ZodError) {
    return errorResponse(context, {
      status: 400,
      code: 'invalid_request',
      message: 'Request body validation failed.',
      details: error.flatten(),
    });
  }

  if (error instanceof Error && options.expectedStatus !== undefined) {
    return errorResponse(context, {
      status: options.expectedStatus,
      code: options.expectedCode ?? 'request_failed',
      message: error.message !== '' ? error.message : options.fallbackMessage,
    });
  }

  context.logger.error('request.failed.unexpected', {
    durationMs: Date.now() - context.startedAt,
    errorMessage: error instanceof Error ? error.message : 'Unknown error',
  });

  return errorResponse(context, {
    status: 500,
    code: 'unexpected_error',
    message: options.fallbackMessage,
  });
}
