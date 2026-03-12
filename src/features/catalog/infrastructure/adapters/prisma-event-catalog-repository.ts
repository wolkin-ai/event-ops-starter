import type { EventCatalogRepository } from '@/features/catalog/application/ports/event-catalog-repository';
import type { PublicEvent } from '@/features/catalog/domain/entities/public-event';
import { prisma } from '@/lib/prisma';

import {
  parseEventSlug,
  toValidatedPublicEvent,
} from './prisma-event-publication-contract';

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

    return events.map(toValidatedPublicEvent);
  }

  async getBySlug(slug: string): Promise<PublicEvent | null> {
    const parsedSlug = parseEventSlug(slug);
    const event = await prisma.eventPublication.findFirst({
      where: {
        slug: parsedSlug,
        status: {
          not: 'draft',
        },
      },
    });

    return event ? toValidatedPublicEvent(event) : null;
  }
}
