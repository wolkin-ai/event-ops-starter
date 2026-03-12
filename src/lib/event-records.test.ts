import { describe, expect, it } from 'vitest';

import type { AdminEvent } from '@/features/admin-events/domain/entities/admin-event';
import type { EventPlan, EventPublication } from '@/generated/prisma/client';

import {
  buildEventPlanRecordFromAdminEvent,
  buildEventPublicationRecordFromPlan,
  toAdminEvent,
  toAdminEventPublication,
  toPublicEvent,
} from './event-records';

function buildEventPublication(
  overrides: Partial<EventPublication> = {},
): EventPublication {
  return {
    eventPlanId: 'event-1',
    slug: 'operator-summit',
    title: 'Operator Summit',
    summary: 'Runbooks for community operators.',
    city: 'Tokyo',
    venue: 'Station Hall',
    heroEyebrow: 'Ops / live',
    heroBlurb: 'A public projection for operator teams.',
    audience: 'Operators',
    trackLabel: 'Operations',
    seatsTotal: 120,
    seatsRemaining: 64,
    status: 'scheduled',
    highlights: JSON.stringify(['Playbooks', 'Checklists']),
    operatorNotes: JSON.stringify(['Doors open at 09:00']),
    startsAt: new Date('2026-06-10T01:00:00.000Z'),
    endsAt: new Date('2026-06-10T05:00:00.000Z'),
    timezone: 'Asia/Tokyo',
    createdAt: new Date('2026-03-01T00:00:00.000Z'),
    updatedAt: new Date('2026-03-01T00:00:00.000Z'),
    ...overrides,
  };
}

function buildEventPlan(overrides: Partial<EventPlan> = {}): EventPlan {
  return {
    id: 'event-1',
    slug: 'operator-summit',
    title: 'Operator Summit',
    city: 'Tokyo',
    venue: 'Station Hall',
    startsAt: new Date('2026-06-10T01:00:00.000Z'),
    endsAt: new Date('2026-06-10T05:00:00.000Z'),
    timezone: 'Asia/Tokyo',
    capacity: 120,
    track: 'Operations',
    status: 'draft',
    summary: 'Runbooks for community operators.',
    createdAt: new Date('2026-03-01T00:00:00.000Z'),
    updatedAt: new Date('2026-03-01T00:00:00.000Z'),
    ...overrides,
  };
}

function buildAdminEvent(overrides: Partial<AdminEvent> = {}): AdminEvent {
  return {
    id: 'event-1',
    title: 'Operator Summit',
    slug: 'operator-summit',
    city: 'Tokyo',
    venue: 'Station Hall',
    startsAt: '2026-06-10T01:00:00.000Z',
    capacity: 120,
    track: 'Operations',
    summary: 'Runbooks for community operators.',
    status: 'draft',
    publicationStatus: 'unpublished',
    createdAt: '2026-03-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('event-records', () => {
  it('maps valid publication records into a public event', () => {
    const publicEvent = toPublicEvent(buildEventPublication());

    expect(publicEvent.status).toBe('scheduled');
    expect(publicEvent.highlights).toEqual(['Playbooks', 'Checklists']);
    expect(publicEvent.operatorNotes).toEqual(['Doors open at 09:00']);
  });

  it('fails fast when a publication status is invalid', () => {
    expect(() =>
      toPublicEvent(
        buildEventPublication({
          status: 'archived',
        }),
      ),
    ).toThrow('Event publication status is invalid for catalog projection.');
  });

  it('fails fast when serialized publication JSON is malformed', () => {
    expect(() =>
      toAdminEventPublication(
        buildEventPublication({
          highlights: '{',
        }),
      ),
    ).toThrow('Event publication highlights must be valid JSON.');
  });

  it('fails fast when a serialized string list has the wrong shape', () => {
    expect(() =>
      toAdminEventPublication(
        buildEventPublication({
          highlights: '{"headline":"bad"}',
        }),
      ),
    ).toThrow('Event publication highlights must be a JSON array of strings.');
  });

  it('fails fast when an admin plan status is invalid', () => {
    expect(() =>
      toAdminEvent(
        buildEventPlan({
          status: 'published',
        }),
      ),
    ).toThrow('Event plan status is invalid for admin projection.');
  });

  it('fails fast when a publication status is invalid for admin projection', () => {
    expect(() =>
      toAdminEvent({
        ...buildEventPlan(),
        publication: {
          status: 'archived',
        },
      }),
    ).toThrow('Event publication status is invalid for admin projection.');
  });

  it('fails fast when persisting an admin plan with an invalid status', () => {
    const invalidAdminEvent = JSON.parse(
      JSON.stringify({
        ...buildAdminEvent(),
        status: 'published',
      }),
    );

    expect(() => buildEventPlanRecordFromAdminEvent(invalidAdminEvent)).toThrow(
      'Event plan status is invalid for persistence.',
    );
  });

  it('fails fast when building a publication record from an invalid plan status', () => {
    expect(() =>
      buildEventPublicationRecordFromPlan(
        buildEventPlan({
          status: 'published',
        }),
      ),
    ).toThrow('Event plan status is invalid for persistence.');
  });

  it('fails fast when building a publication record from an invalid publication status', () => {
    expect(() =>
      buildEventPublicationRecordFromPlan(buildEventPlan(), {
        existingPublication: buildEventPublication({
          status: 'archived',
        }),
      }),
    ).toThrow('Event publication status is invalid for persistence.');
  });

  it('fails fast when building a publication record from malformed publication JSON', () => {
    expect(() =>
      buildEventPublicationRecordFromPlan(buildEventPlan(), {
        existingPublication: buildEventPublication({
          highlights: '{',
        }),
      }),
    ).toThrow('Event publication highlights must be valid JSON.');
  });
});
