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

interface PublicationRouteContext {
  readonly params: Promise<{
    readonly eventId: string;
  }>;
}

const updatePublicationSchema = z.object({
  eventId: z.string().trim().min(1),
  title: z.string().trim().min(4),
  summary: z.string().trim().min(8),
  heroEyebrow: z.string().trim().min(4),
  heroBlurb: z.string().trim().min(8),
  audience: z.string().trim().min(4),
  trackLabel: z.string().trim().min(2),
  highlights: z.array(z.string()).min(1),
  operatorNotes: z.array(z.string()).min(1),
});

const publicationResponseSchema = z.object({
  eventId: z.string().min(1),
  slug: z.string().min(1),
  publicationStatus: z.enum(['published', 'unpublished']),
  title: z.string().min(1),
  summary: z.string().min(1),
  heroEyebrow: z.string().min(1),
  heroBlurb: z.string().min(1),
  audience: z.string().min(1),
  trackLabel: z.string().min(1),
  highlights: z.array(z.string()),
  operatorNotes: z.array(z.string()),
  seatsTotal: z.number().int(),
  seatsRemaining: z.number().int(),
  city: z.string().min(1),
  venue: z.string().min(1),
  startsAt: z.string().min(1),
});

const publicationActionResponseSchema = z.object({
  id: z.string().min(1),
  publicationStatus: z.enum(['published', 'unpublished']),
});

async function requireAdminSession(
  routeContext: ReturnType<typeof createRouteContext>,
) {
  const { getCurrentSession } = createSessionServices();
  const session = await getCurrentSession.execute();

  if (!session || session.role !== 'admin') {
    return errorResponse(routeContext, {
      status: 403,
      code: 'admin_session_required',
      message: 'Admin session required.',
    });
  }

  return null;
}

export async function GET(request: Request, context: PublicationRouteContext) {
  const routeContext = createRouteContext(
    request,
    'api.admin.events.publication.get',
  );
  const unauthorized = await requireAdminSession(routeContext);

  if (unauthorized) {
    return unauthorized;
  }

  const { eventId } = await context.params;
  const { getAdminEventPublication } = createAdminEventServices();
  const publication = await getAdminEventPublication.execute(eventId);

  if (!publication) {
    return errorResponse(routeContext, {
      status: 404,
      code: 'event_publication_not_found',
      message: 'Event publication not found.',
    });
  }

  return jsonResponse(routeContext, publicationResponseSchema, publication);
}

export async function POST(request: Request, context: PublicationRouteContext) {
  const routeContext = createRouteContext(
    request,
    'api.admin.events.publication.publish',
  );
  const unauthorized = await requireAdminSession(routeContext);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { eventId } = await context.params;
    const { publishAdminEvent } = createAdminEventServices();
    const event = await publishAdminEvent.execute(eventId);

    return jsonResponse(routeContext, publicationActionResponseSchema, {
      id: event.id,
      publicationStatus: event.publicationStatus,
    });
  } catch (error) {
    return handleRouteError(routeContext, error, {
      fallbackMessage: 'Event publication failed.',
      expectedStatus: 400,
      expectedCode: 'event_publication_failed',
    });
  }
}

export async function DELETE(
  request: Request,
  context: PublicationRouteContext,
) {
  const routeContext = createRouteContext(
    request,
    'api.admin.events.publication.withdraw',
  );
  const unauthorized = await requireAdminSession(routeContext);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { eventId } = await context.params;
    const { unpublishAdminEvent } = createAdminEventServices();
    const event = await unpublishAdminEvent.execute(eventId);

    return jsonResponse(routeContext, publicationActionResponseSchema, {
      id: event.id,
      publicationStatus: event.publicationStatus,
    });
  } catch (error) {
    return handleRouteError(routeContext, error, {
      fallbackMessage: 'Event publication withdrawal failed.',
      expectedStatus: 400,
      expectedCode: 'event_publication_withdraw_failed',
    });
  }
}

export async function PUT(request: Request, context: PublicationRouteContext) {
  const routeContext = createRouteContext(
    request,
    'api.admin.events.publication.update',
  );
  const unauthorized = await requireAdminSession(routeContext);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { eventId } = await context.params;
    const body = await readRequestJson(
      request,
      updatePublicationSchema,
      routeContext,
    );

    if (body.eventId !== eventId) {
      return errorResponse(routeContext, {
        status: 400,
        code: 'event_id_mismatch',
        message: 'EventId mismatch.',
      });
    }

    const { updateAdminEventPublication } = createAdminEventServices();
    const publication = await updateAdminEventPublication.execute(body);

    return jsonResponse(routeContext, publicationResponseSchema, publication);
  } catch (error) {
    return handleRouteError(routeContext, error, {
      fallbackMessage: 'Publication update failed.',
      expectedStatus: 400,
      expectedCode: 'publication_update_failed',
    });
  }
}
