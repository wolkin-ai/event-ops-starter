import { CreateRegistrationUseCase } from '@/features/registration/application/usecases/create-registration-usecase';
import { ListRegistrationsUseCase } from '@/features/registration/application/usecases/list-registrations-usecase';
import type { RegistrationRepository } from '@/features/registration/application/ports/registration-repository';
import { PrismaRegistrationRepository } from '@/features/registration/infrastructure/adapters/prisma-registration-repository';

interface RegistrationServicesOptions {
  readonly repository?: RegistrationRepository;
}

export function createRegistrationServices(
  options: RegistrationServicesOptions = {},
) {
  const repository = options.repository ?? new PrismaRegistrationRepository();

  return {
    createRegistration: new CreateRegistrationUseCase(repository),
    listRegistrations: new ListRegistrationsUseCase(repository),
  };
}
