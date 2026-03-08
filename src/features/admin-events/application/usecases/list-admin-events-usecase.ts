import type { AdminEventRepository } from '@/features/admin-events/application/ports/admin-event-repository';
import type { AdminEvent } from '@/features/admin-events/domain/entities/admin-event';

export class ListAdminEventsUseCase {
  constructor(private readonly repository: AdminEventRepository) {}

  async execute(): Promise<readonly AdminEvent[]> {
    return this.repository.list();
  }
}
