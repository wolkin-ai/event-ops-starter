import type { AdminEventRepository } from '@/features/admin-events/application/ports/admin-event-repository';
import type { AdminEvent } from '@/features/admin-events/domain/entities/admin-event';

export class UnpublishAdminEventUseCase {
  constructor(private readonly repository: AdminEventRepository) {}

  async execute(eventId: string): Promise<AdminEvent> {
    const normalizedEventId = eventId.trim();

    if (!normalizedEventId) {
      throw new Error('EventId is required.');
    }

    return this.repository.unpublish(normalizedEventId);
  }
}
