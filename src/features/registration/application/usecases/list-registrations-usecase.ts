import type { RegistrationRepository } from '@/features/registration/application/ports/registration-repository';
import type { Registration } from '@/features/registration/domain/entities/registration';

export class ListRegistrationsUseCase {
  constructor(private readonly repository: RegistrationRepository) {}

  async execute(filters?: {
    readonly attendeeEmail?: string;
  }): Promise<readonly Registration[]> {
    return this.repository.list(filters);
  }
}
