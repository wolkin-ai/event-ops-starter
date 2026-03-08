import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createRegistrationServices } from '@/composition/registration';
import { createSessionServices } from '@/composition/session';

const createRegistrationSchema = z.object({
  eventId: z.string().trim().min(1),
  attendeeName: z.string().trim().min(2),
  attendeeEmail: z.string().trim().email(),
  company: z.string().trim(),
  seatCount: z.number().int().min(1).max(6),
  notes: z.string().trim(),
});

export async function POST(request: Request) {
  try {
    const input = createRegistrationSchema.parse(await request.json());
    const { createRegistration } = createRegistrationServices();
    const { issueSession } = createSessionServices();
    const registration = await createRegistration.execute(input);
    const cookie = await issueSession.execute({
      name: registration.attendeeName,
      email: registration.attendeeEmail,
      role: 'attendee',
    });
    const response = NextResponse.json(
      {
        id: registration.id,
        reference: registration.id.slice(0, 8).toUpperCase(),
      },
      { status: 201 },
    );

    response.cookies.set(cookie.name, cookie.value, cookie.options);

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Registration failed.';

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
