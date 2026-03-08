import type { AdminEventRepository } from '@/features/admin-events/application/ports/admin-event-repository';
import type { AdminEvent } from '@/features/admin-events/domain/entities/admin-event';
import { EventCapacity } from '@/features/admin-events/domain/value-objects/event-capacity';
import { createSlug } from '@/lib/create-slug';

export interface CreateAdminEventInput {
  readonly title: string;
  readonly city: string;
  readonly venue: string;
  readonly startsAt: string;
  readonly capacity: number;
  readonly track: string;
  readonly summary: string;
}

export class CreateAdminEventUseCase {
  constructor(private readonly repository: AdminEventRepository) {}

  async execute(input: CreateAdminEventInput): Promise<AdminEvent> {
    const title = input.title.trim();
    const city = input.city.trim();
    const venue = input.venue.trim();
    const track = input.track.trim();
    const summary = input.summary.trim();

    if (title.length < 4) {
      throw new Error('Title must contain at least 4 characters.');
    }

    if (!input.startsAt) {
      throw new Error('StartsAt is required.');
    }

    const capacity = new EventCapacity(input.capacity);
    const adminEvent: AdminEvent = {
      id: crypto.randomUUID(),
      title,
      slug: createSlug(title),
      city,
      venue,
      startsAt: input.startsAt,
      capacity: capacity.value,
      track,
      summary,
      status: 'draft',
      publicationStatus: 'unpublished',
      createdAt: new Date().toISOString(),
    };

    await this.repository.create(adminEvent);

    return adminEvent;
  }
}
