import type { Registration } from '@/features/registration/domain/entities/registration';

export interface RegistrationRepository {
  save(registration: Registration): Promise<void>;
  list(filters?: {
    readonly attendeeEmail?: string;
  }): Promise<readonly Registration[]>;
}
