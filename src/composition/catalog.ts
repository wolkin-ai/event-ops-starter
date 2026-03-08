import { GetPublicEventBySlugUseCase } from '@/features/catalog/application/usecases/get-public-event-by-slug-usecase';
import { ListPublicEventsUseCase } from '@/features/catalog/application/usecases/list-public-events-usecase';
import type { EventCatalogRepository } from '@/features/catalog/application/ports/event-catalog-repository';
import { PrismaEventCatalogRepository } from '@/features/catalog/infrastructure/adapters/prisma-event-catalog-repository';

interface CatalogServicesOptions {
  readonly repository?: EventCatalogRepository;
}

export function createCatalogServices(options: CatalogServicesOptions = {}) {
  const repository = options.repository ?? new PrismaEventCatalogRepository();

  return {
    listPublicEvents: new ListPublicEventsUseCase(repository),
    getPublicEventBySlug: new GetPublicEventBySlugUseCase(repository),
  };
}
