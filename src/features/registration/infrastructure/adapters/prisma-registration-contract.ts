import type { Registration } from '@/features/registration/domain/entities/registration';
import { z } from 'zod';

const registrationStatusSchema = z.enum(['confirmed']);

const registrationSchema = z.object({
  id: z.string().min(1),
  eventId: z.string().min(1),
  attendeeName: z.string().trim().min(2),
  attendeeEmail: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),
  company: z.string().trim(),
  seatCount: z.number().int().min(1).max(6),
  notes: z.string().trim(),
  status: registrationStatusSchema,
  createdAt: z.string().datetime({ offset: true }),
});

const publicationAvailabilitySchema = z.object({
  seatsRemaining: z.number().int().nonnegative(),
  status: z.enum(['draft', 'scheduled', 'sold_out']),
});

const registrationRecordSchema = z.object({
  id: z.string().min(1),
  eventPlanId: z.string().min(1),
  attendeeName: z.string().trim().min(2),
  attendeeEmail: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),
  company: z.string().trim(),
  seatCount: z.number().int().min(1),
  notes: z.string().trim(),
  status: registrationStatusSchema,
  createdAt: z.date(),
});

const registrationCreateDataSchema = z.object({
  id: z.string().min(1),
  eventPlanId: z.string().min(1),
  attendeeName: z.string().trim().min(2),
  attendeeEmail: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),
  company: z.string().trim(),
  seatCount: z.number().int().min(1).max(6),
  notes: z.string().trim(),
  status: registrationStatusSchema,
  createdAt: z.date(),
});

const publicationSeatUpdateDataSchema = z.object({
  seatsRemaining: z.object({
    decrement: z.number().int().min(1).max(6),
  }),
});

const attendeeEmailFilterSchema = z
  .string()
  .trim()
  .email()
  .transform((value) => value.toLowerCase());

export type RegistrationRecord = z.infer<typeof registrationRecordSchema>;
export type RegistrationCreateData = z.infer<
  typeof registrationCreateDataSchema
>;
export type PublicationAvailability = z.infer<
  typeof publicationAvailabilitySchema
>;
export type PublicationSeatUpdateData = z.infer<
  typeof publicationSeatUpdateDataSchema
>;

export function parseRegistration(value: Registration): Registration {
  return registrationSchema.parse(value);
}

export function parsePublicationAvailability(
  value: unknown,
): PublicationAvailability | null {
  if (value === null) {
    return null;
  }

  const result = publicationAvailabilitySchema.safeParse(value);

  if (!result.success) {
    throw new Error(
      'Event publication availability is invalid for registration adapter.',
    );
  }

  return result.data;
}

export function parseRegistrationRecord(value: unknown): RegistrationRecord {
  const result = registrationRecordSchema.safeParse(value);

  if (!result.success) {
    throw new Error('Registration record is invalid for registration adapter.');
  }

  return result.data;
}

export function parseRegistrationCreateData(
  value: unknown,
): RegistrationCreateData {
  const result = registrationCreateDataSchema.safeParse(value);

  if (!result.success) {
    throw new Error('Registration create input is invalid for persistence.');
  }

  return result.data;
}

export function parsePublicationSeatUpdateData(
  value: unknown,
): PublicationSeatUpdateData {
  const result = publicationSeatUpdateDataSchema.safeParse(value);

  if (!result.success) {
    throw new Error(
      'Event publication seat update is invalid for persistence.',
    );
  }

  return result.data;
}

export function parseAttendeeEmailFilter(
  attendeeEmail: string | undefined,
): string | undefined {
  if (attendeeEmail === undefined) {
    return undefined;
  }

  const trimmedAttendeeEmail = attendeeEmail.trim();

  if (trimmedAttendeeEmail === '') {
    return undefined;
  }

  const result = attendeeEmailFilterSchema.safeParse(trimmedAttendeeEmail);

  if (!result.success) {
    throw new Error(
      'Registration attendeeEmail filter is invalid for registration adapter.',
    );
  }

  return result.data;
}
