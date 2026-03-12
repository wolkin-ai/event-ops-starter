import type { EventPublication } from '@/generated/prisma/client';
import { toPublicEvent } from '@/lib/event-records';
import { z } from 'zod';

const eventPublicationRecordSchema = z.object({
  eventPlanId: z.string().min(1),
  slug: z.string().min(1),
  title: z.string(),
  summary: z.string(),
  city: z.string(),
  venue: z.string(),
  heroEyebrow: z.string(),
  heroBlurb: z.string(),
  audience: z.string(),
  trackLabel: z.string(),
  seatsTotal: z.number().int().nonnegative(),
  seatsRemaining: z.number().int().nonnegative(),
  status: z.enum(['draft', 'scheduled', 'sold_out']),
  highlights: z.string(),
  operatorNotes: z.string(),
  startsAt: z.date(),
  endsAt: z.date(),
  timezone: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});
const eventSlugSchema = z.string().trim().min(1);

export function parseEventPublicationRecord(value: unknown): EventPublication {
  const result = eventPublicationRecordSchema.safeParse(value);

  if (!result.success) {
    throw new Error('Event publication record is invalid for catalog adapter.');
  }

  return result.data;
}

export function parseEventSlug(value: string): string {
  const result = eventSlugSchema.safeParse(value);

  if (!result.success) {
    throw new Error('Event slug is invalid for catalog adapter.');
  }

  return result.data;
}

export function toValidatedPublicEvent(value: unknown) {
  return toPublicEvent(parseEventPublicationRecord(value));
}
