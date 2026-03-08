import { cookies } from 'next/headers';

import type { SessionGateway } from '@/features/session/application/ports/session-gateway';
import type {
  Session,
  SessionCookieDescriptor,
} from '@/features/session/domain/entities/session';
import {
  decodeSessionToken,
  encodeSessionToken,
} from '@/features/session/infrastructure/adapters/session-token-codec';

export const SESSION_COOKIE_NAME = 'event-ops-starter.session';

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function createCookieOptions(
  maxAge: number,
): SessionCookieDescriptor['options'] {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  };
}

export class CookieSessionGateway implements SessionGateway {
  async read(): Promise<Session | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    return decodeSessionToken(token);
  }

  async issue(session: Session): Promise<SessionCookieDescriptor> {
    return {
      name: SESSION_COOKIE_NAME,
      value: await encodeSessionToken(session),
      options: createCookieOptions(SESSION_MAX_AGE),
    };
  }

  async clear(): Promise<SessionCookieDescriptor> {
    return {
      name: SESSION_COOKIE_NAME,
      value: '',
      options: createCookieOptions(0),
    };
  }
}
