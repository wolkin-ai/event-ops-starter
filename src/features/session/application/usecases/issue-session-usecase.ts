import type { SessionGateway } from '@/features/session/application/ports/session-gateway';
import type {
  Session,
  SessionCookieDescriptor,
} from '@/features/session/domain/entities/session';

export class IssueSessionUseCase {
  constructor(private readonly gateway: SessionGateway) {}

  async execute(session: Session): Promise<SessionCookieDescriptor> {
    return this.gateway.issue(session);
  }
}
