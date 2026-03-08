import type { RegistrationRepository } from '@/features/registration/application/ports/registration-repository';
import type { Registration } from '@/features/registration/domain/entities/registration';
import { RegistrationEmail } from '@/features/registration/domain/value-objects/registration-email';

export interface CreateRegistrationInput {
  readonly eventId: string;
  readonly attendeeName: string;
  readonly attendeeEmail: string;
  readonly company: string;
  readonly seatCount: number;
  readonly notes: string;
}

export class CreateRegistrationUseCase {
  constructor(private readonly repository: RegistrationRepository) {}

  async execute(input: CreateRegistrationInput): Promise<Registration> {
    const attendeeName = input.attendeeName.trim();
    const company = input.company.trim();
    const notes = input.notes.trim();

    if (attendeeName.length < 2) {
      throw new Error('Attendee name must contain at least 2 characters.');
    }

    if (input.seatCount < 1 || input.seatCount > 6) {
      throw new Error('Seat count must stay between 1 and 6.');
    }

    const email = new RegistrationEmail(input.attendeeEmail);
    const registration: Registration = {
      id: crypto.randomUUID(),
      eventId: input.eventId,
      attendeeName,
      attendeeEmail: email.value,
      company,
      seatCount: input.seatCount,
      notes,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    await this.repository.save(registration);

    return registration;
  }
}
