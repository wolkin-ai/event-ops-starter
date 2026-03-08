import type { PublicEvent } from '@/features/catalog/domain/entities/public-event';

export interface EventCatalogRepository {
  listAll(): Promise<readonly PublicEvent[]>;
  getBySlug(slug: string): Promise<PublicEvent | null>;
}
