import { z } from 'zod';

import { createRegistrationServices } from '@/composition/registration';
import { createSessionServices } from '@/composition/session';
import {
  createRouteContext,
  handleRouteError,
  jsonResponse,
  readRequestJson,
} from '@/lib/http/route-contract';

const createRegistrationSchema = z.object({
  eventId: z.string().trim().min(1),
  attendeeName: z.string().trim().min(2),
  attendeeEmail: z.string().trim().email(),
  company: z.string().trim(),
  seatCount: z.number().int().min(1).max(6),
  notes: z.string().trim(),
});

const createRegistrationResponseSchema = z.object({
  id: z.string().min(1),
  reference: z.string().min(1),
});

export async function POST(request: Request) {
  const context = createRouteContext(request, 'api.registrations.create');

  try {
    const input = await readRequestJson(
      request,
      createRegistrationSchema,
      context,
    );
    const { createRegistration } = createRegistrationServices();
    const { issueSession } = createSessionServices();
    const registration = await createRegistration.execute(input);
    const cookie = await issueSession.execute({
      name: registration.attendeeName,
      email: registration.attendeeEmail,
      role: 'attendee',
    });
    const response = jsonResponse(
      context,
      createRegistrationResponseSchema,
      {
        id: registration.id,
        reference: registration.id.slice(0, 8).toUpperCase(),
      },
      { status: 201 },
    );

    response.cookies.set(cookie.name, cookie.value, cookie.options);

    return response;
  } catch (error) {
    return handleRouteError(context, error, {
      fallbackMessage: 'Registration failed.',
      expectedStatus: 400,
      expectedCode: 'registration_failed',
    });
  }
}
