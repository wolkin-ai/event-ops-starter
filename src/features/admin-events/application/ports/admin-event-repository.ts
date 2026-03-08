import type { AdminEvent } from '@/features/admin-events/domain/entities/admin-event';
import type { AdminEventPublication } from '@/features/admin-events/domain/entities/admin-event-publication';

export interface AdminEventRepository {
  create(event: AdminEvent): Promise<void>;
  list(): Promise<readonly AdminEvent[]>;
  publish(eventId: string): Promise<AdminEvent>;
  unpublish(eventId: string): Promise<AdminEvent>;
  getPublication(eventId: string): Promise<AdminEventPublication | null>;
  updatePublication(
    publication: AdminEventPublication,
  ): Promise<AdminEventPublication>;
}
