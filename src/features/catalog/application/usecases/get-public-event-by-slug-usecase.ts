import type { EventCatalogRepository } from '@/features/catalog/application/ports/event-catalog-repository';
import type { PublicEvent } from '@/features/catalog/domain/entities/public-event';

export class GetPublicEventBySlugUseCase {
  constructor(private readonly repository: EventCatalogRepository) {}

  async execute(slug: string): Promise<PublicEvent | null> {
    return this.repository.getBySlug(slug);
  }
}
