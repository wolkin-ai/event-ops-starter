import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createSessionServices } from '@/composition/session';

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

export async function POST(request: Request) {
  try {
    const body = sessionSchema.parse(await request.json());
    const { issueSession } = createSessionServices();
    const cookie = await issueSession.execute({
      name: body.name,
      email: body.email,
      role: body.role,
    });
    const response = NextResponse.json({
      redirectTo: resolveRedirectPath(body.role, body.nextPath),
    });

    response.cookies.set(cookie.name, cookie.value, cookie.options);

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to create session.';

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE() {
  const { clearSession } = createSessionServices();
  const cookie = await clearSession.execute();
  const response = NextResponse.json({ success: true });

  response.cookies.set(cookie.name, cookie.value, cookie.options);

  return response;
}
