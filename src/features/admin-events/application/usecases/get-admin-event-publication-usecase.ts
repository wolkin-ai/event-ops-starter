import type { AdminEventRepository } from '@/features/admin-events/application/ports/admin-event-repository';
import type { AdminEventPublication } from '@/features/admin-events/domain/entities/admin-event-publication';

export class GetAdminEventPublicationUseCase {
  constructor(private readonly repository: AdminEventRepository) {}

  async execute(eventId: string): Promise<AdminEventPublication | null> {
    const normalizedEventId = eventId.trim();

    if (!normalizedEventId) {
      throw new Error('EventId is required.');
    }

    return this.repository.getPublication(normalizedEventId);
  }
}
