import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createAdminEventServices } from '@/composition/admin-events';
import { createSessionServices } from '@/composition/session';

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

async function requireAdminSession() {
  const { getCurrentSession } = createSessionServices();
  const session = await getCurrentSession.execute();

  if (!session || session.role !== 'admin') {
    return NextResponse.json(
      { error: 'Admin session required.' },
      { status: 403 },
    );
  }

  return null;
}

export async function GET(request: Request, context: PublicationRouteContext) {
  void request;
  const unauthorized = await requireAdminSession();

  if (unauthorized) {
    return unauthorized;
  }

  const { eventId } = await context.params;
  const { getAdminEventPublication } = createAdminEventServices();
  const publication = await getAdminEventPublication.execute(eventId);

  if (!publication) {
    return NextResponse.json(
      { error: 'Event publication not found.' },
      { status: 404 },
    );
  }

  return NextResponse.json(publication);
}

export async function POST(request: Request, context: PublicationRouteContext) {
  void request;
  const unauthorized = await requireAdminSession();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { eventId } = await context.params;
    const { publishAdminEvent } = createAdminEventServices();
    const event = await publishAdminEvent.execute(eventId);

    return NextResponse.json({
      id: event.id,
      publicationStatus: event.publicationStatus,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Event publication failed.';

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  context: PublicationRouteContext,
) {
  void request;
  const unauthorized = await requireAdminSession();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { eventId } = await context.params;
    const { unpublishAdminEvent } = createAdminEventServices();
    const event = await unpublishAdminEvent.execute(eventId);

    return NextResponse.json({
      id: event.id,
      publicationStatus: event.publicationStatus,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Event publication withdrawal failed.';

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(request: Request, context: PublicationRouteContext) {
  const unauthorized = await requireAdminSession();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { eventId } = await context.params;
    const body = updatePublicationSchema.parse(await request.json());

    if (body.eventId !== eventId) {
      return NextResponse.json({ error: 'EventId mismatch.' }, { status: 400 });
    }

    const { updateAdminEventPublication } = createAdminEventServices();
    const publication = await updateAdminEventPublication.execute(body);

    return NextResponse.json(publication);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Publication update failed.';

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
