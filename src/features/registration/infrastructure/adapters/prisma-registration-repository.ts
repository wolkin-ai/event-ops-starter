import type { RegistrationRepository } from '@/features/registration/application/ports/registration-repository';
import type { Registration } from '@/features/registration/domain/entities/registration';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';

const registrationStatusSchema = z.enum(['confirmed']);

function toRegistration(record: {
  id: string;
  eventPlanId: string;
  attendeeName: string;
  attendeeEmail: string;
  company: string;
  seatCount: number;
  notes: string;
  status: string;
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
    status: registrationStatusSchema.parse(record.status),
    createdAt: record.createdAt.toISOString(),
  };
}

export class PrismaRegistrationRepository implements RegistrationRepository {
  async save(registration: Registration): Promise<void> {
    const publication = await prisma.eventPublication.findUnique({
      where: { eventPlanId: registration.eventId },
      select: {
        seatsRemaining: true,
        status: true,
      },
    });

    if (!publication || publication.status === 'draft') {
      throw new Error('Event is not open for registration.');
    }

    if (registration.seatCount > publication.seatsRemaining) {
      throw new Error('Not enough seats remaining for this registration.');
    }

    await prisma.$transaction([
      prisma.registration.create({
        data: {
          id: registration.id,
          eventPlanId: registration.eventId,
          attendeeName: registration.attendeeName,
          attendeeEmail: registration.attendeeEmail,
          company: registration.company,
          seatCount: registration.seatCount,
          notes: registration.notes,
          status: registration.status,
          createdAt: new Date(registration.createdAt),
        },
      }),
      prisma.eventPublication.update({
        where: { eventPlanId: registration.eventId },
        data: {
          seatsRemaining: {
            decrement: registration.seatCount,
          },
        },
      }),
    ]);
  }

  async list(filters?: {
    readonly attendeeEmail?: string;
  }): Promise<readonly Registration[]> {
    const attendeeEmail = filters?.attendeeEmail;
    const registrations = await prisma.registration.findMany({
      where:
        attendeeEmail !== undefined && attendeeEmail !== ''
          ? {
              attendeeEmail,
            }
          : undefined,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return registrations.map(toRegistration);
  }
}
