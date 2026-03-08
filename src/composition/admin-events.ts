import { CreateAdminEventUseCase } from '@/features/admin-events/application/usecases/create-admin-event-usecase';
import { GetAdminEventPublicationUseCase } from '@/features/admin-events/application/usecases/get-admin-event-publication-usecase';
import { ListAdminEventsUseCase } from '@/features/admin-events/application/usecases/list-admin-events-usecase';
import { PublishAdminEventUseCase } from '@/features/admin-events/application/usecases/publish-admin-event-usecase';
import { UnpublishAdminEventUseCase } from '@/features/admin-events/application/usecases/unpublish-admin-event-usecase';
import { UpdateAdminEventPublicationUseCase } from '@/features/admin-events/application/usecases/update-admin-event-publication-usecase';
import type { AdminEventRepository } from '@/features/admin-events/application/ports/admin-event-repository';
import { PrismaAdminEventRepository } from '@/features/admin-events/infrastructure/adapters/prisma-admin-event-repository';

interface AdminEventServicesOptions {
  readonly repository?: AdminEventRepository;
}

export function createAdminEventServices(
  options: AdminEventServicesOptions = {},
) {
  const repository = options.repository ?? new PrismaAdminEventRepository();

  return {
    createAdminEvent: new CreateAdminEventUseCase(repository),
    listAdminEvents: new ListAdminEventsUseCase(repository),
    publishAdminEvent: new PublishAdminEventUseCase(repository),
    unpublishAdminEvent: new UnpublishAdminEventUseCase(repository),
    getAdminEventPublication: new GetAdminEventPublicationUseCase(repository),
    updateAdminEventPublication: new UpdateAdminEventPublicationUseCase(
      repository,
    ),
  };
}
