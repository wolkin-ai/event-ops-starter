import type { AdminEventRepository } from '@/features/admin-events/application/ports/admin-event-repository';
import type { AdminEvent } from '@/features/admin-events/domain/entities/admin-event';
import type { AdminEventPublication } from '@/features/admin-events/domain/entities/admin-event-publication';
import {
  buildAdminEventPlanRecord,
  buildAdminEventPublicationRecord,
  parseAdminEvent,
  parseAdminEventPublication,
} from './prisma-admin-event-contract';
import { prisma } from '@/lib/prisma';

export class PrismaAdminEventRepository implements AdminEventRepository {
  async create(event: AdminEvent): Promise<void> {
    await prisma.eventPlan.create({
      data: buildAdminEventPlanRecord(event),
    });
  }

  async list(): Promise<readonly AdminEvent[]> {
    const events = await prisma.eventPlan.findMany({
      include: {
        publication: {
          select: {
            status: true,
          },
        },
      },
      orderBy: [
        {
          createdAt: 'desc',
        },
        {
          startsAt: 'asc',
        },
      ],
    });

    return events.map(parseAdminEvent);
  }

  async publish(eventId: string): Promise<AdminEvent> {
    return prisma.$transaction(async (tx) => {
      const event = await tx.eventPlan.findUnique({
        where: { id: eventId },
        include: {
          publication: true,
          registrations: {
            select: {
              seatCount: true,
            },
          },
        },
      });

      if (!event) {
        throw new Error('Admin event not found.');
      }

      const reservedSeats = event.registrations.reduce(
        (total, registration) => total + registration.seatCount,
        0,
      );
      const publicationRecord = buildAdminEventPublicationRecord(event, {
        existingPublication: event.publication,
        reservedSeats,
      });

      await tx.eventPlan.update({
        where: { id: eventId },
        data: {
          status: 'scheduled',
        },
      });
      await tx.eventPublication.upsert({
        where: { eventPlanId: eventId },
        create: publicationRecord,
        update: publicationRecord,
      });

      const updatedEvent = await tx.eventPlan.findUniqueOrThrow({
        where: { id: eventId },
        include: {
          publication: {
            select: {
              status: true,
            },
          },
        },
      });

      return parseAdminEvent(updatedEvent);
    });
  }

  async unpublish(eventId: string): Promise<AdminEvent> {
    return prisma.$transaction(async (tx) => {
      const event = await tx.eventPlan.findUnique({
        where: { id: eventId },
        include: {
          publication: {
            select: {
              status: true,
            },
          },
          registrations: {
            select: {
              id: true,
            },
            take: 1,
          },
        },
      });

      if (!event) {
        throw new Error('Admin event not found.');
      }

      parseAdminEvent(event);

      if (!event.publication || event.publication.status === 'draft') {
        throw new Error('Event publication is already withdrawn.');
      }

      if (event.registrations.length > 0) {
        throw new Error(
          'Event publication cannot be withdrawn after registrations exist.',
        );
      }

      await tx.eventPublication.update({
        where: { eventPlanId: eventId },
        data: {
          status: 'draft',
        },
      });

      const updatedEvent = await tx.eventPlan.findUniqueOrThrow({
        where: { id: eventId },
        include: {
          publication: {
            select: {
              status: true,
            },
          },
        },
      });

      return parseAdminEvent(updatedEvent);
    });
  }

  async getPublication(eventId: string): Promise<AdminEventPublication | null> {
    const publication = await prisma.eventPublication.findUnique({
      where: { eventPlanId: eventId },
    });

    return publication ? parseAdminEventPublication(publication) : null;
  }

  async updatePublication(
    publication: AdminEventPublication,
  ): Promise<AdminEventPublication> {
    const existingPublication = await prisma.eventPublication.findUnique({
      where: { eventPlanId: publication.eventId },
    });

    if (!existingPublication) {
      throw new Error(
        'Event publication must exist before public copy can be edited.',
      );
    }

    parseAdminEventPublication(existingPublication);

    const nextPublication = {
      ...existingPublication,
      title: publication.title,
      summary: publication.summary,
      heroEyebrow: publication.heroEyebrow,
      heroBlurb: publication.heroBlurb,
      audience: publication.audience,
      trackLabel: publication.trackLabel,
      highlights: JSON.stringify(publication.highlights),
      operatorNotes: JSON.stringify(publication.operatorNotes),
    };

    parseAdminEventPublication(nextPublication);

    const updatedPublication = await prisma.eventPublication.update({
      where: { eventPlanId: publication.eventId },
      data: {
        title: nextPublication.title,
        summary: nextPublication.summary,
        heroEyebrow: nextPublication.heroEyebrow,
        heroBlurb: nextPublication.heroBlurb,
        audience: nextPublication.audience,
        trackLabel: nextPublication.trackLabel,
        highlights: nextPublication.highlights,
        operatorNotes: nextPublication.operatorNotes,
      },
    });

    return parseAdminEventPublication(updatedPublication);
  }
}
