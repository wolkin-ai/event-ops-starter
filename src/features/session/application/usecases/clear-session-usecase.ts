import type { SessionGateway } from '@/features/session/application/ports/session-gateway';
import type { SessionCookieDescriptor } from '@/features/session/domain/entities/session';

export class ClearSessionUseCase {
  constructor(private readonly gateway: SessionGateway) {}

  async execute(): Promise<SessionCookieDescriptor> {
    return this.gateway.clear();
  }
}
