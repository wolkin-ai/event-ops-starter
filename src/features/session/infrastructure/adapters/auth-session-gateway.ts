import type { SessionGateway } from '@/features/session/application/ports/session-gateway';
import type {
  Session,
  SessionCookieDescriptor,
} from '@/features/session/domain/entities/session';
import { parseSession } from '@/features/session/infrastructure/adapters/session-contract';

function unsupportedDescriptor(): SessionCookieDescriptor {
  return {
    name: 'authjs-session',
    value: '',
    options: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 0,
    },
  };
}

export class AuthSessionGateway implements SessionGateway {
  async read(): Promise<Session | null> {
    const { auth } = await import('@/lib/auth');
    const session = await auth();

    if (session === null) {
      return null;
    }

    try {
      return parseSession(session.user);
    } catch {
      return null;
    }
  }

  async issue(): Promise<SessionCookieDescriptor> {
    throw new Error(
      'AuthSessionGateway.issue is not supported. Use Auth.js signIn on the client.',
    );
  }

  async clear(): Promise<SessionCookieDescriptor> {
    return unsupportedDescriptor();
  }
}
