import { describe, expect, test } from 'vitest';

import { createAdminEventServices } from '@/composition/admin-events';
import { createCatalogServices } from '@/composition/catalog';
import { createRegistrationServices } from '@/composition/registration';
import { createSessionServices } from '@/composition/session';
import type { AdminEventRepository } from '@/features/admin-events/application/ports/admin-event-repository';
import type { AdminEvent } from '@/features/admin-events/domain/entities/admin-event';
import type { AdminEventPublication } from '@/features/admin-events/domain/entities/admin-event-publication';
import type { EventCatalogRepository } from '@/features/catalog/application/ports/event-catalog-repository';
import type { PublicEvent } from '@/features/catalog/domain/entities/public-event';
import type { RegistrationRepository } from '@/features/registration/application/ports/registration-repository';
import type { Registration } from '@/features/registration/domain/entities/registration';
import type { SessionGateway } from '@/features/session/application/ports/session-gateway';
import type {
  Session,
  SessionCookieDescriptor,
} from '@/features/session/domain/entities/session';

describe('composition roots', () => {
  test('catalog services accept repository overrides', async () => {
    const events: readonly PublicEvent[] = [
      {
        id: 'evt_1',
        slug: 'launch-room',
        title: 'Launch Room',
        summary: 'Public projection',
        city: 'Tokyo',
        venue: 'Studio North',
        heroEyebrow: 'Launch',
        heroBlurb: 'Operator-ready',
        audience: 'Operators',
        trackLabel: 'Summit',
        seatsTotal: 10,
        seatsRemaining: 4,
        status: 'scheduled',
        schedule: {
          startsAt: '2026-01-01T10:00:00.000Z',
          endsAt: '2026-01-01T12:00:00.000Z',
          timezone: 'UTC',
        },
        highlights: [],
        operatorNotes: [],
      },
    ];
    const repository: EventCatalogRepository = {
      async listAll() {
        return events;
      },
      async getBySlug(slug) {
        return events.find((event) => event.slug === slug) ?? null;
      },
    };

    const services = createCatalogServices({ repository });

    await expect(services.listPublicEvents.execute()).resolves.toEqual(events);
  });

  test('registration services accept repository overrides', async () => {
    const items: Registration[] = [];
    const repository: RegistrationRepository = {
      async save(registration) {
        items.push(registration);
      },
      async list() {
        return items;
      },
    };

    const services = createRegistrationServices({ repository });
    const result = await services.createRegistration.execute({
      eventId: 'evt_1',
      attendeeName: 'Aki Ito',
      attendeeEmail: 'aki@example.com',
      company: 'North Star Labs',
      seatCount: 1,
      notes: '',
    });

    expect(result.attendeeEmail).toBe('aki@example.com');
    await expect(services.listRegistrations.execute()).resolves.toHaveLength(1);
  });

  test('admin event services accept repository overrides', async () => {
    const items: AdminEvent[] = [];
    const repository: AdminEventRepository = {
      async create(event) {
        items.push(event);
      },
      async list() {
        return items;
      },
      async publish(eventId) {
        const event = items.find((item) => item.id === eventId);

        if (!event) {
          throw new Error('Admin event not found.');
        }

        return {
          ...event,
          status: 'scheduled',
          publicationStatus: 'published',
        };
      },
      async unpublish(eventId) {
        const event = items.find((item) => item.id === eventId);

        if (!event) {
          throw new Error('Admin event not found.');
        }

        return {
          ...event,
          publicationStatus: 'unpublished',
        };
      },
      async getPublication() {
        return null;
      },
      async updatePublication(
        publication: AdminEventPublication,
      ): Promise<AdminEventPublication> {
        return publication;
      },
    };

    const services = createAdminEventServices({ repository });
    await services.createAdminEvent.execute({
      title: 'Control Room Clinic',
      city: 'Tokyo',
      venue: 'Studio North',
      startsAt: '2026-08-21T10:00',
      capacity: 80,
      track: 'Clinic',
      summary: 'Hands-on clinic',
    });

    await expect(services.listAdminEvents.execute()).resolves.toHaveLength(1);
  });

  test('session services accept gateway overrides', async () => {
    const cookie: SessionCookieDescriptor = {
      name: 'session',
      value: 'token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/',
        maxAge: 60,
      },
    };
    const session: Session = {
      name: 'Aki Ito',
      email: 'aki@example.com',
      role: 'attendee',
    };
    const gateway: SessionGateway = {
      async read() {
        return session;
      },
      async issue() {
        return cookie;
      },
      async clear() {
        return {
          ...cookie,
          value: '',
          options: { ...cookie.options, maxAge: 0 },
        };
      },
    };

    const services = createSessionServices({ gateway });

    await expect(services.getCurrentSession.execute()).resolves.toEqual(
      session,
    );
    await expect(services.issueSession.execute(session)).resolves.toEqual(
      cookie,
    );
  });
});
