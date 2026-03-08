import type { SessionGateway } from '@/features/session/application/ports/session-gateway';
import type { Session } from '@/features/session/domain/entities/session';

export class GetCurrentSessionUseCase {
  constructor(private readonly gateway: SessionGateway) {}

  async execute(): Promise<Session | null> {
    return this.gateway.read();
  }
}
