import type {
  Session,
  SessionCookieDescriptor,
} from '@/features/session/domain/entities/session';

export interface SessionGateway {
  read(): Promise<Session | null>;
  issue(session: Session): Promise<SessionCookieDescriptor>;
  clear(): Promise<SessionCookieDescriptor>;
}
