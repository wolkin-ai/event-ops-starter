import type { RegistrationRepository } from '@/features/registration/application/ports/registration-repository';
import type { Registration } from '@/features/registration/domain/entities/registration';

import { prisma } from '@/lib/prisma';

import {
  parseAttendeeEmailFilter,
  parsePublicationAvailability,
  parsePublicationSeatUpdateData,
  parseRegistration,
  parseRegistrationCreateData,
  parseRegistrationRecord,
} from './prisma-registration-contract';

function toRegistration(record: {
  id: string;
  eventPlanId: string;
  attendeeName: string;
  attendeeEmail: string;
  company: string;
  seatCount: number;
  notes: string;
  status: 'confirmed';
  createdAt: Date;
}): Registration {
  return {
    id: record.id,
    eventId: record.eventPlanId,
    attendeeName: record.attendeeName,
    attendeeEmail: record.attendeeEmail,
    company: record.company,
    seatCount: record.seatCount,
    notes: record.notes,
    status: record.status,
    createdAt: record.createdAt.toISOString(),
  };
}

export class PrismaRegistrationRepository implements RegistrationRepository {
  async save(registration: Registration): Promise<void> {
    const parsedRegistration = parseRegistration(registration);
    const publication = parsePublicationAvailability(
      await prisma.eventPublication.findUnique({
        where: { eventPlanId: parsedRegistration.eventId },
        select: {
          seatsRemaining: true,
          status: true,
        },
      }),
    );
    const createInput = parseRegistrationCreateData({
      id: parsedRegistration.id,
      eventPlanId: parsedRegistration.eventId,
      attendeeName: parsedRegistration.attendeeName,
      attendeeEmail: parsedRegistration.attendeeEmail,
      company: parsedRegistration.company,
      seatCount: parsedRegistration.seatCount,
      notes: parsedRegistration.notes,
      status: parsedRegistration.status,
      createdAt: new Date(parsedRegistration.createdAt),
    });
    const seatUpdate = parsePublicationSeatUpdateData({
      seatsRemaining: {
        decrement: parsedRegistration.seatCount,
      },
    });

    if (publication === null || publication.status === 'draft') {
      throw new Error('Event is not open for registration.');
    }

    if (parsedRegistration.seatCount > publication.seatsRemaining) {
      throw new Error('Not enough seats remaining for this registration.');
    }

    await prisma.$transaction([
      prisma.registration.create({
        data: createInput,
      }),
      prisma.eventPublication.update({
        where: { eventPlanId: parsedRegistration.eventId },
        data: seatUpdate,
      }),
    ]);
  }

  async list(filters?: {
    readonly attendeeEmail?: string;
  }): Promise<readonly Registration[]> {
    const attendeeEmail = parseAttendeeEmailFilter(filters?.attendeeEmail);
    const registrations = await prisma.registration.findMany({
      where:
        attendeeEmail !== undefined
          ? {
              attendeeEmail,
            }
          : undefined,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return registrations.map((record) =>
      toRegistration(parseRegistrationRecord(record)),
    );
  }
}
