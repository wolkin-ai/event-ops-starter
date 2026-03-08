import { z } from 'zod';

import { createSessionServices } from '@/composition/session';
import {
  createRouteContext,
  handleRouteError,
  jsonResponse,
  readRequestJson,
} from '@/lib/http/route-contract';

const sessionSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  role: z.enum(['attendee', 'admin']),
  nextPath: z
    .string()
    .trim()
    .optional()
    .transform((value) => {
      if (!value || !value.startsWith('/') || value.startsWith('//')) {
        return null;
      }

      return value;
    }),
});

function resolveRedirectPath(
  role: 'attendee' | 'admin',
  nextPath: string | null,
) {
  if (nextPath) {
    return nextPath;
  }

  return role === 'admin' ? '/admin' : '/dashboard';
}

const createSessionResponseSchema = z.object({
  redirectTo: z.string().min(1),
});

const clearSessionResponseSchema = z.object({
  success: z.literal(true),
});

export async function POST(request: Request) {
  const context = createRouteContext(request, 'api.auth.session.create');

  try {
    const body = await readRequestJson(request, sessionSchema, context);
    const { issueSession } = createSessionServices();
    const cookie = await issueSession.execute({
      name: body.name,
      email: body.email,
      role: body.role,
    });
    const response = jsonResponse(context, createSessionResponseSchema, {
      redirectTo: resolveRedirectPath(body.role, body.nextPath),
    });

    response.cookies.set(cookie.name, cookie.value, cookie.options);

    return response;
  } catch (error) {
    return handleRouteError(context, error, {
      fallbackMessage: 'Failed to create session.',
      expectedStatus: 400,
      expectedCode: 'session_create_failed',
    });
  }
}

export async function DELETE(request: Request) {
  const context = createRouteContext(request, 'api.auth.session.clear');
  const { clearSession } = createSessionServices();
  const cookie = await clearSession.execute();
  const response = jsonResponse(context, clearSessionResponseSchema, {
    success: true,
  });

  response.cookies.set(cookie.name, cookie.value, cookie.options);

  return response;
}
