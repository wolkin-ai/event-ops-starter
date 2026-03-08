import { describe, expect, it } from 'vitest';

import type { AdminEventRepository } from '../ports/admin-event-repository';
import { PublishAdminEventUseCase } from './publish-admin-event-usecase';
import { UnpublishAdminEventUseCase } from './unpublish-admin-event-usecase';
import type { AdminEvent } from '../../domain/entities/admin-event';
import type { AdminEventPublication } from '../../domain/entities/admin-event-publication';

class InMemoryAdminEventRepository implements AdminEventRepository {
  constructor(readonly items: AdminEvent[]) {}

  async create(event: AdminEvent): Promise<void> {
    void event;
    throw new Error('Not implemented for this test.');
  }

  async list(): Promise<readonly AdminEvent[]> {
    return this.items;
  }

  async publish(eventId: string): Promise<AdminEvent> {
    const index = this.items.findIndex((item) => item.id === eventId);

    if (index === -1) {
      throw new Error('Admin event not found.');
    }

    const updatedEvent: AdminEvent = {
      ...this.items[index],
      status: 'scheduled',
      publicationStatus: 'published',
    };

    this.items.splice(index, 1, updatedEvent);

    return updatedEvent;
  }

  async unpublish(eventId: string): Promise<AdminEvent> {
    const index = this.items.findIndex((item) => item.id === eventId);

    if (index === -1) {
      throw new Error('Admin event not found.');
    }

    const updatedEvent: AdminEvent = {
      ...this.items[index],
      publicationStatus: 'unpublished',
    };

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

const seededEvent: AdminEvent = {
  id: 'adm_1',
  title: 'Control Room Clinic',
  slug: 'control-room-clinic',
  city: 'Tokyo',
  venue: 'Studio North',
  startsAt: '2026-08-21T10:00:00+09:00',
  capacity: 80,
  track: 'Clinic',
  summary: 'Hands-on clinic for runbooks and response drills.',
  status: 'draft',
  publicationStatus: 'unpublished',
  createdAt: '2026-04-01T09:00:00+09:00',
};

describe('publication use cases', () => {
  it('publishes a draft admin event through the repository boundary', async () => {
    const repository = new InMemoryAdminEventRepository([seededEvent]);
    const useCase = new PublishAdminEventUseCase(repository);

    const result = await useCase.execute(` ${seededEvent.id} `);

    expect(result.publicationStatus).toBe('published');
    expect(result.status).toBe('scheduled');
  });

  it('withdraws a publication through the repository boundary', async () => {
    const repository = new InMemoryAdminEventRepository([
      {
        ...seededEvent,
        status: 'scheduled',
        publicationStatus: 'published',
      },
    ]);
    const useCase = new UnpublishAdminEventUseCase(repository);

    const result = await useCase.execute(seededEvent.id);

    expect(result.publicationStatus).toBe('unpublished');
    expect(result.status).toBe('scheduled');
  });

  it('rejects a blank event id before calling infrastructure', async () => {
    const repository = new InMemoryAdminEventRepository([seededEvent]);
    const useCase = new PublishAdminEventUseCase(repository);

    await expect(useCase.execute('   ')).rejects.toThrow(
      'EventId is required.',
    );
  });
});
