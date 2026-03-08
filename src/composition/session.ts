import { ClearSessionUseCase } from '@/features/session/application/usecases/clear-session-usecase';
import { GetCurrentSessionUseCase } from '@/features/session/application/usecases/get-current-session-usecase';
import { IssueSessionUseCase } from '@/features/session/application/usecases/issue-session-usecase';
import type { SessionGateway } from '@/features/session/application/ports/session-gateway';
import { CookieSessionGateway } from '@/features/session/infrastructure/adapters/cookie-session-gateway';

interface SessionServicesOptions {
  readonly gateway?: SessionGateway;
}

export function createSessionServices(options: SessionServicesOptions = {}) {
  const gateway = options.gateway ?? new CookieSessionGateway();

  return {
    getCurrentSession: new GetCurrentSessionUseCase(gateway),
    issueSession: new IssueSessionUseCase(gateway),
    clearSession: new ClearSessionUseCase(gateway),
  };
}
