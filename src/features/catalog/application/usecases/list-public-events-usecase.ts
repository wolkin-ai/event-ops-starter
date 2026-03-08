import type { EventCatalogRepository } from '@/features/catalog/application/ports/event-catalog-repository';
import type { PublicEvent } from '@/features/catalog/domain/entities/public-event';

export class ListPublicEventsUseCase {
  constructor(private readonly repository: EventCatalogRepository) {}

  async execute(): Promise<readonly PublicEvent[]> {
    return this.repository.listAll();
  }
}
