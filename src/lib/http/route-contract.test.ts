import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import {
  createRouteContext,
  errorResponse,
  handleRouteError,
  jsonResponse,
  readRequestJson,
} from './route-contract';

const errorPayloadSchema = z.object({
  error: z.string(),
  code: z.string(),
  requestId: z.string(),
});

describe('route-contract', () => {
  it('parses a valid JSON body through the route helper', async () => {
    const request = new Request('http://localhost/api/test', {
      method: 'POST',
      body: JSON.stringify({ title: 'Operator Summit' }),
      headers: {
        'content-type': 'application/json',
      },
    });
    const context = createRouteContext(request, 'test.route');

    const parsed = await readRequestJson(
      request,
      z.object({
        title: z.string().min(4),
      }),
      context,
    );

    expect(parsed).toEqual({ title: 'Operator Summit' });
  });

  it('returns a structured error for invalid request bodies', async () => {
    const request = new Request('http://localhost/api/test', {
      method: 'POST',
      body: JSON.stringify({ title: 'no' }),
      headers: {
        'content-type': 'application/json',
      },
    });
    const context = createRouteContext(request, 'test.route');

    await expect(
      readRequestJson(
        request,
        z.object({
          title: z.string().min(4),
        }),
        context,
      ),
    ).rejects.toMatchObject({
      status: 400,
      code: 'invalid_request',
    });
  });

  it('validates route responses before returning them', async () => {
    const request = new Request('http://localhost/api/test');
    const context = createRouteContext(request, 'test.route');
    const response = jsonResponse(
      context,
      z.object({
        ok: z.literal(true),
      }),
      { ok: true },
    );

    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(response.headers.get('x-request-id')).toBe(context.requestId);
  });

  it('wraps unexpected errors with requestId-aware payloads', async () => {
    const request = new Request('http://localhost/api/test');
    const context = createRouteContext(request, 'test.route');
    const response = handleRouteError(context, new Error('boom'), {
      fallbackMessage: 'Request failed.',
      expectedStatus: 400,
      expectedCode: 'request_failed',
    });
    const payload = errorPayloadSchema.parse(await response.json());

    expect(response.status).toBe(400);
    expect(payload.error).toBe('boom');
    expect(payload.code).toBe('request_failed');
    expect(payload.requestId).toBe(context.requestId);
  });

  it('keeps explicit error responses consistent', async () => {
    const request = new Request('http://localhost/api/test');
    const context = createRouteContext(request, 'test.route');
    const response = errorResponse(context, {
      status: 403,
      code: 'forbidden',
      message: 'Forbidden.',
    });

    await expect(response.json()).resolves.toEqual({
      error: 'Forbidden.',
      code: 'forbidden',
      requestId: context.requestId,
    });
  });
});
