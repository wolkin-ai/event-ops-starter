import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createAdminEventServices } from '@/composition/admin-events';
import { createSessionServices } from '@/composition/session';

const createAdminEventSchema = z.object({
  title: z.string().trim().min(4),
  city: z.string().trim().min(2),
  venue: z.string().trim().min(2),
  startsAt: z.string().trim().min(1),
  capacity: z.number().int().min(1).max(10000),
  track: z.string().trim().min(2),
  summary: z.string().trim().min(4),
});

export async function POST(request: Request) {
  const { getCurrentSession } = createSessionServices();
  const session = await getCurrentSession.execute();

  if (!session || session.role !== 'admin') {
    return NextResponse.json(
      { error: 'Admin session required.' },
      { status: 403 },
    );
  }

  try {
    const input = createAdminEventSchema.parse(await request.json());
    const { createAdminEvent } = createAdminEventServices();
    const event = await createAdminEvent.execute(input);

    return NextResponse.json(
      {
        id: event.id,
        reference: event.id.slice(0, 8).toUpperCase(),
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Event creation failed.';

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
