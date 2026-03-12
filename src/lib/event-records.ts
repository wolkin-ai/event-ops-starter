import type { EventPlan, EventPublication } from '@/generated/prisma/client';
import { z } from 'zod';

import type { AdminEvent } from '@/features/admin-events/domain/entities/admin-event';
import type { AdminEventPublication } from '@/features/admin-events/domain/entities/admin-event-publication';
import type { PublicEvent } from '@/features/catalog/domain/entities/public-event';
import { adminEventSeeds, publicEventSeeds } from '@/lib/seed-data';

const DEFAULT_TIMEZONE = 'Asia/Tokyo';
const stringListSchema = z.array(z.string());
const adminEventStatusSchema = z.enum(['scheduled', 'draft']);
const publicEventStatusSchema = z.enum(['scheduled', 'sold_out', 'draft']);
const eventPublicationStatusSchema = z.enum(['draft', 'scheduled', 'sold_out']);

function validateValue<T>(
  schema: z.ZodType<T>,
  value: unknown,
  message: string,
): T {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new Error(message);
  }

  return result.data;
}

function serializeList(items: readonly string[]) {
  return JSON.stringify(items);
}

function deserializeList(value: string, fieldName: string): readonly string[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error(`${fieldName} must be valid JSON.`);
  }

  return validateValue(
    stringListSchema,
    parsed,
    `${fieldName} must be a JSON array of strings.`,
  );
}

function addHours(value: string, hours: number) {
  return new Date(new Date(value).getTime() + hours * 60 * 60 * 1000);
}

function findAdminSeedBySlug(slug: string) {
  return adminEventSeeds.find((event) => event.slug === slug) ?? null;
}

export function buildSeedEventPlanRecords() {
  const publishedPlanRecords = publicEventSeeds.map((event) => {
    const adminSeed = findAdminSeedBySlug(event.slug);

    return {
      id: event.id,
      slug: event.slug,
      title: event.title,
      city: event.city,
      venue: event.venue,
      startsAt: new Date(event.schedule.startsAt),
      endsAt: new Date(event.schedule.endsAt),
      timezone: event.schedule.timezone,
      capacity: event.seatsTotal,
      track: event.trackLabel,
      status: event.status,
      summary: event.summary,
      createdAt: adminSeed ? new Date(adminSeed.createdAt) : new Date(),
    };
  });

  const adminOnlyPlanRecords = adminEventSeeds
    .filter(
      (event) =>
        !publicEventSeeds.some(
          (publicEvent) => publicEvent.slug === event.slug,
        ),
    )
    .map((event) => ({
      id: event.id,
      slug: event.slug,
      title: event.title,
      city: event.city,
      venue: event.venue,
      startsAt: new Date(event.startsAt),
      endsAt: addHours(event.startsAt, 4),
      timezone: DEFAULT_TIMEZONE,
      capacity: event.capacity,
      track: event.track,
      status: event.status,
      summary: event.summary,
      createdAt: new Date(event.createdAt),
    }));

  return [...publishedPlanRecords, ...adminOnlyPlanRecords];
}

export function buildSeedEventPublicationRecords() {
  return publicEventSeeds.map((event) => ({
    eventPlanId: event.id,
    slug: event.slug,
    title: event.title,
    summary: event.summary,
    city: event.city,
    venue: event.venue,
    heroEyebrow: event.heroEyebrow,
    heroBlurb: event.heroBlurb,
    audience: event.audience,
    trackLabel: event.trackLabel,
    seatsTotal: event.seatsTotal,
    seatsRemaining: event.seatsRemaining,
    status: event.status,
    highlights: serializeList(event.highlights),
    operatorNotes: serializeList(event.operatorNotes),
    startsAt: new Date(event.schedule.startsAt),
    endsAt: new Date(event.schedule.endsAt),
    timezone: event.schedule.timezone,
  }));
}

export function buildEventPlanRecordFromAdminEvent(event: AdminEvent) {
  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    city: event.city,
    venue: event.venue,
    startsAt: new Date(event.startsAt),
    endsAt: addHours(event.startsAt, 4),
    timezone: DEFAULT_TIMEZONE,
    capacity: event.capacity,
    track: event.track,
    status: event.status,
    summary: event.summary,
    createdAt: new Date(event.createdAt),
  };
}

export function toPublicEvent(event: EventPublication): PublicEvent {
  return {
    id: event.eventPlanId,
    slug: event.slug,
    title: event.title,
    summary: event.summary,
    city: event.city,
    venue: event.venue,
    heroEyebrow: event.heroEyebrow,
    heroBlurb: event.heroBlurb,
    audience: event.audience,
    trackLabel: event.trackLabel,
    seatsTotal: event.seatsTotal,
    seatsRemaining: event.seatsRemaining,
    status: validateValue(
      publicEventStatusSchema,
      event.status,
      'Event publication status is invalid for catalog projection.',
    ),
    schedule: {
      startsAt: event.startsAt.toISOString(),
      endsAt: event.endsAt.toISOString(),
      timezone: event.timezone,
    },
    highlights: deserializeList(
      event.highlights,
      'Event publication highlights',
    ),
    operatorNotes: deserializeList(
      event.operatorNotes,
      'Event publication operator notes',
    ),
  };
}

function derivePublicationStatus(
  publication: Pick<EventPublication, 'status'> | null | undefined,
): AdminEvent['publicationStatus'] {
  const status = publication
    ? validateValue(
        eventPublicationStatusSchema,
        publication.status,
        'Event publication status is invalid for admin projection.',
      )
    : null;

  return status && status !== 'draft' ? 'published' : 'unpublished';
}

export function buildEventPublicationRecordFromPlan(
  event: Pick<
    EventPlan,
    | 'id'
    | 'slug'
    | 'title'
    | 'summary'
    | 'city'
    | 'venue'
    | 'startsAt'
    | 'endsAt'
    | 'timezone'
    | 'capacity'
    | 'track'
  >,
  options: {
    readonly existingPublication?: EventPublication | null;
    readonly reservedSeats?: number;
  } = {},
) {
  const reservedSeats = options.reservedSeats ?? 0;
  const seatsRemaining = Math.max(event.capacity - reservedSeats, 0);
  const existingPublication = options.existingPublication ?? null;

  return {
    eventPlanId: event.id,
    slug: event.slug,
    title: event.title,
    summary: event.summary,
    city: event.city,
    venue: event.venue,
    heroEyebrow:
      existingPublication?.heroEyebrow ?? `${event.track} / live publication`,
    heroBlurb:
      existingPublication?.heroBlurb ??
      `${event.title} is now available in the public event catalog.`,
    audience:
      existingPublication?.audience ??
      'Operators, producers, community builders',
    trackLabel: existingPublication?.trackLabel ?? event.track,
    seatsTotal: event.capacity,
    seatsRemaining,
    status: seatsRemaining === 0 ? 'sold_out' : 'scheduled',
    highlights:
      existingPublication?.highlights ??
      serializeList([
        `${event.track} format`,
        `${event.city} operating playbook`,
        `${event.capacity} total seats`,
      ]),
    operatorNotes:
      existingPublication?.operatorNotes ??
      serializeList([
        'Published explicitly from the admin control room.',
        'Keep public copy synchronized through the publication flow.',
      ]),
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    timezone: event.timezone,
  };
}

export function toAdminEvent(
  event: EventPlan & {
    publication?: Pick<EventPublication, 'status'> | null;
  },
): AdminEvent {
  return {
    id: event.id,
    title: event.title,
    slug: event.slug,
    city: event.city,
    venue: event.venue,
    startsAt: event.startsAt.toISOString(),
    capacity: event.capacity,
    track: event.track,
    summary: event.summary,
    status: validateValue(
      adminEventStatusSchema,
      event.status,
      'Event plan status is invalid for admin projection.',
    ),
    publicationStatus: derivePublicationStatus(event.publication),
    createdAt: event.createdAt.toISOString(),
  };
}

export function toAdminEventPublication(
  publication: EventPublication,
): AdminEventPublication {
  return {
    eventId: publication.eventPlanId,
    slug: publication.slug,
    publicationStatus: derivePublicationStatus(publication),
    title: publication.title,
    summary: publication.summary,
    heroEyebrow: publication.heroEyebrow,
    heroBlurb: publication.heroBlurb,
    audience: publication.audience,
    trackLabel: publication.trackLabel,
    highlights: deserializeList(
      publication.highlights,
      'Event publication highlights',
    ),
    operatorNotes: deserializeList(
      publication.operatorNotes,
      'Event publication operator notes',
    ),
    seatsTotal: publication.seatsTotal,
    seatsRemaining: publication.seatsRemaining,
    city: publication.city,
    venue: publication.venue,
    startsAt: publication.startsAt.toISOString(),
  };
}
