import { z } from 'zod';

import { createAdminEventServices } from '@/composition/admin-events';
import { createSessionServices } from '@/composition/session';
import {
  createRouteContext,
  errorResponse,
  handleRouteError,
  jsonResponse,
  readRequestJson,
} from '@/lib/http/route-contract';

const createAdminEventSchema = z.object({
  title: z.string().trim().min(4),
  city: z.string().trim().min(2),
  venue: z.string().trim().min(2),
  startsAt: z.string().trim().min(1),
  capacity: z.number().int().min(1).max(10000),
  track: z.string().trim().min(2),
  summary: z.string().trim().min(4),
});

const createAdminEventResponseSchema = z.object({
  id: z.string().min(1),
  reference: z.string().min(1),
});

export async function POST(request: Request) {
  const context = createRouteContext(request, 'api.admin.events.create');
  const { getCurrentSession } = createSessionServices();
  const session = await getCurrentSession.execute();

  if (!session || session.role !== 'admin') {
    return errorResponse(context, {
      status: 403,
      code: 'admin_session_required',
      message: 'Admin session required.',
    });
  }

  try {
    const input = await readRequestJson(
      request,
      createAdminEventSchema,
      context,
    );
    const { createAdminEvent } = createAdminEventServices();
    const event = await createAdminEvent.execute(input);

    return jsonResponse(
      context,
      createAdminEventResponseSchema,
      {
        id: event.id,
        reference: event.id.slice(0, 8).toUpperCase(),
      },
      { status: 201 },
    );
  } catch (error) {
    return handleRouteError(context, error, {
      fallbackMessage: 'Event creation failed.',
      expectedStatus: 400,
      expectedCode: 'event_create_failed',
    });
  }
}
