import { describe, expect, it } from 'vitest';

import { CreateAdminEventUseCase } from './create-admin-event-usecase';
import type { AdminEventRepository } from '../ports/admin-event-repository';
import type { AdminEvent } from '../../domain/entities/admin-event';
import type { AdminEventPublication } from '../../domain/entities/admin-event-publication';

class InMemoryAdminEventRepository implements AdminEventRepository {
  readonly items: AdminEvent[] = [];

  async create(event: AdminEvent): Promise<void> {
    this.items.push(event);
  }

  async list(): Promise<readonly AdminEvent[]> {
    return this.items;
  }

  async publish(eventId: string): Promise<AdminEvent> {
    const event = this.items.find((item) => item.id === eventId);

    if (!event) {
      throw new Error('Admin event not found.');
    }

    const updatedEvent: AdminEvent = {
      ...event,
      status: 'scheduled',
      publicationStatus: 'published',
    };
    const index = this.items.findIndex((item) => item.id === eventId);

    this.items.splice(index, 1, updatedEvent);

    return updatedEvent;
  }

  async unpublish(eventId: string): Promise<AdminEvent> {
    const event = this.items.find((item) => item.id === eventId);

    if (!event) {
      throw new Error('Admin event not found.');
    }

    const updatedEvent: AdminEvent = {
      ...event,
      publicationStatus: 'unpublished',
    };
    const index = this.items.findIndex((item) => item.id === eventId);

    this.items.splice(index, 1, updatedEvent);

    return updatedEvent;
  }

  async getPublication(): Promise<AdminEventPublication | null> {
    return null;
  }

  async updatePublication(
    publication: AdminEventPublication,
  ): Promise<AdminEventPublication> {
    return publication;
  }
}

describe('CreateAdminEventUseCase', () => {
  it('creates a draft admin event with a slug', async () => {
    const repository = new InMemoryAdminEventRepository();
    const useCase = new CreateAdminEventUseCase(repository);

    const result = await useCase.execute({
      title: 'Control Room Clinic',
      city: 'Tokyo',
      venue: 'Studio North',
      startsAt: '2026-08-21T10:00',
      capacity: 80,
      track: 'Clinic',
      summary: 'Hands-on clinic for runbooks and response drills.',
    });

    expect(result.slug).toBe('control-room-clinic');
    expect(result.status).toBe('draft');
    expect(result.publicationStatus).toBe('unpublished');
    expect(repository.items).toHaveLength(1);
  });

  it('rejects invalid capacities', async () => {
    const repository = new InMemoryAdminEventRepository();
    const useCase = new CreateAdminEventUseCase(repository);

    await expect(
      useCase.execute({
        title: 'Control Room Clinic',
        city: 'Tokyo',
        venue: 'Studio North',
        startsAt: '2026-08-21T10:00',
        capacity: 0,
        track: 'Clinic',
        summary: 'Hands-on clinic for runbooks and response drills.',
      }),
    ).rejects.toThrow('EventCapacity must be an integer between 1 and 10000.');
  });
});
