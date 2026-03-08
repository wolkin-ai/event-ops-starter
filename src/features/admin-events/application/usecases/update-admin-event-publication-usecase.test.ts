import { describe, expect, it } from 'vitest';

import type { AdminEventRepository } from '../ports/admin-event-repository';
import { GetAdminEventPublicationUseCase } from './get-admin-event-publication-usecase';
import { UpdateAdminEventPublicationUseCase } from './update-admin-event-publication-usecase';
import type { AdminEvent } from '../../domain/entities/admin-event';
import type { AdminEventPublication } from '../../domain/entities/admin-event-publication';

const seededPublication: AdminEventPublication = {
  eventId: 'evt_1',
  slug: 'control-room-clinic',
  publicationStatus: 'published',
  title: 'Control Room Clinic',
  summary: 'Original summary for a live event.',
  heroEyebrow: 'Clinic / live publication',
  heroBlurb: 'Original hero copy for the live event.',
  audience: 'Operators and producers',
  trackLabel: 'Clinic',
  highlights: ['Runbook teardown'],
  operatorNotes: ['Original operator note'],
  seatsTotal: 80,
  seatsRemaining: 80,
  city: 'Tokyo',
  venue: 'Studio North',
  startsAt: '2026-08-21T10:00:00+09:00',
};

class InMemoryAdminEventRepository implements AdminEventRepository {
  constructor(private publication: AdminEventPublication | null) {}

  async create(event: AdminEvent): Promise<void> {
    void event;
    throw new Error('Not implemented for this test.');
  }

  async list(): Promise<readonly AdminEvent[]> {
    return [];
  }

  async publish(eventId: string): Promise<AdminEvent> {
    void eventId;
    throw new Error('Not implemented for this test.');
  }

  async unpublish(eventId: string): Promise<AdminEvent> {
    void eventId;
    throw new Error('Not implemented for this test.');
  }

  async getPublication(): Promise<AdminEventPublication | null> {
    return this.publication;
  }

  async updatePublication(
    publication: AdminEventPublication,
  ): Promise<AdminEventPublication> {
    this.publication = publication;

    return publication;
  }
}

describe('publication editor use cases', () => {
  it('loads an existing publication through the repository boundary', async () => {
    const repository = new InMemoryAdminEventRepository(seededPublication);
    const useCase = new GetAdminEventPublicationUseCase(repository);

    await expect(useCase.execute(seededPublication.eventId)).resolves.toEqual(
      seededPublication,
    );
  });

  it('updates market-facing publication copy without mutating plan-only fields', async () => {
    const repository = new InMemoryAdminEventRepository(seededPublication);
    const useCase = new UpdateAdminEventPublicationUseCase(repository);

    const result = await useCase.execute({
      eventId: seededPublication.eventId,
      title: 'Control Room Clinic Live',
      summary: 'Updated summary for a stronger public narrative.',
      heroEyebrow: 'Live / operator clinic',
      heroBlurb: 'Refined hero copy for the public event detail page.',
      audience: 'Operations and field marketing teams',
      trackLabel: 'Live clinic',
      highlights: ['Runbook teardown', 'Live incident drills'],
      operatorNotes: ['Keep public copy aligned with the control room brief.'],
    });

    expect(result.title).toBe('Control Room Clinic Live');
    expect(result.slug).toBe(seededPublication.slug);
    expect(result.venue).toBe(seededPublication.venue);
  });

  it('rejects empty highlights before calling infrastructure', async () => {
    const repository = new InMemoryAdminEventRepository(seededPublication);
    const useCase = new UpdateAdminEventPublicationUseCase(repository);

    await expect(
      useCase.execute({
        eventId: seededPublication.eventId,
        title: 'Control Room Clinic Live',
        summary: 'Updated summary for a stronger public narrative.',
        heroEyebrow: 'Live / operator clinic',
        heroBlurb: 'Refined hero copy for the public event detail page.',
        audience: 'Operations and field marketing teams',
        trackLabel: 'Live clinic',
        highlights: [],
        operatorNotes: [
          'Keep public copy aligned with the control room brief.',
        ],
      }),
    ).rejects.toThrow('At least one highlight is required.');
  });
});
