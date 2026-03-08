import { describe, expect, it } from 'vitest';

import { CreateRegistrationUseCase } from './create-registration-usecase';
import type { RegistrationRepository } from '../ports/registration-repository';
import type { Registration } from '../../domain/entities/registration';

class InMemoryRegistrationRepository implements RegistrationRepository {
  readonly items: Registration[] = [];

  async save(registration: Registration): Promise<void> {
    this.items.push(registration);
  }

  async list(): Promise<readonly Registration[]> {
    return this.items;
  }
}

describe('CreateRegistrationUseCase', () => {
  it('saves a normalized confirmed registration', async () => {
    const repository = new InMemoryRegistrationRepository();
    const useCase = new CreateRegistrationUseCase(repository);

    const result = await useCase.execute({
      eventId: 'evt_signal_summit_tokyo',
      attendeeName: 'Aki Ito',
      attendeeEmail: ' AKI@example.com ',
      company: 'North Star Labs',
      seatCount: 2,
      notes: 'Needs an accessible aisle seat.',
    });

    expect(result.status).toBe('confirmed');
    expect(result.attendeeEmail).toBe('aki@example.com');
    expect(repository.items).toHaveLength(1);
  });

  it('rejects invalid seat counts', async () => {
    const repository = new InMemoryRegistrationRepository();
    const useCase = new CreateRegistrationUseCase(repository);

    await expect(
      useCase.execute({
        eventId: 'evt_signal_summit_tokyo',
        attendeeName: 'Aki Ito',
        attendeeEmail: 'aki@example.com',
        company: 'North Star Labs',
        seatCount: 0,
        notes: '',
      }),
    ).rejects.toThrow('Seat count must stay between 1 and 6.');
  });
});
