import type { EventCatalogRepository } from '@/features/catalog/application/ports/event-catalog-repository';
import type { PublicEvent } from '@/features/catalog/domain/entities/public-event';
import { toPublicEvent } from '@/lib/event-records';
import { prisma } from '@/lib/prisma';

export class PrismaEventCatalogRepository implements EventCatalogRepository {
  async listAll(): Promise<readonly PublicEvent[]> {
    const events = await prisma.eventPublication.findMany({
      where: {
        status: {
          not: 'draft',
        },
      },
      orderBy: {
        startsAt: 'asc',
      },
    });

    return events.map(toPublicEvent);
  }

  async getBySlug(slug: string): Promise<PublicEvent | null> {
    const event = await prisma.eventPublication.findFirst({
      where: {
        slug,
        status: {
          not: 'draft',
        },
      },
    });

    return event ? toPublicEvent(event) : null;
  }
}
