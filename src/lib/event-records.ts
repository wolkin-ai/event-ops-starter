import type { EventPlan, EventPublication } from '@/generated/prisma/client';

import type { AdminEvent } from '@/features/admin-events/domain/entities/admin-event';
import type { AdminEventPublication } from '@/features/admin-events/domain/entities/admin-event-publication';
import type { PublicEvent } from '@/features/catalog/domain/entities/public-event';
import { adminEventSeeds, publicEventSeeds } from '@/lib/seed-data';

const DEFAULT_TIMEZONE = 'Asia/Tokyo';

function serializeList(items: readonly string[]) {
  return JSON.stringify(items);
}

function deserializeList(value: string): readonly string[] {
  try {
    const parsed = JSON.parse(value) as unknown;

    return Array.isArray(parsed)
      ? parsed.filter((item) => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
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
    status: event.status as PublicEvent['status'],
    schedule: {
      startsAt: event.startsAt.toISOString(),
      endsAt: event.endsAt.toISOString(),
      timezone: event.timezone,
    },
    highlights: deserializeList(event.highlights),
    operatorNotes: deserializeList(event.operatorNotes),
  };
}

function derivePublicationStatus(
  publication: Pick<EventPublication, 'status'> | null | undefined,
): AdminEvent['publicationStatus'] {
  return publication && publication.status !== 'draft'
    ? 'published'
    : 'unpublished';
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
    status: event.status as AdminEvent['status'],
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
    highlights: deserializeList(publication.highlights),
    operatorNotes: deserializeList(publication.operatorNotes),
    seatsTotal: publication.seatsTotal,
    seatsRemaining: publication.seatsRemaining,
    city: publication.city,
    venue: publication.venue,
    startsAt: publication.startsAt.toISOString(),
  };
}
