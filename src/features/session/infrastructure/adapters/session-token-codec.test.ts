import { describe, expect, test } from 'vitest';

import {
  decodeSessionToken,
  encodeSessionToken,
} from '@/features/session/infrastructure/adapters/session-token-codec';
import { CookieSessionGateway } from '@/features/session/infrastructure/adapters/cookie-session-gateway';
import { SESSION_COOKIE_NAME } from '@/features/session/infrastructure/adapters/cookie-session-gateway';

describe('session-token-codec', () => {
  test('encodes and decodes a valid session payload', async () => {
    const token = await encodeSessionToken({
      email: 'Admin@Example.com',
      name: 'Control Room Admin',
      role: 'admin',
    });

    const payload = await decodeSessionToken(token);

    expect(payload).toEqual({
      email: 'admin@example.com',
      name: 'Control Room Admin',
      role: 'admin',
    });
  });

  test('returns null for a tampered token', async () => {
    const token = await encodeSessionToken({
      email: 'aki@example.com',
      name: 'Aki Ito',
      role: 'attendee',
    });
    const tampered = `${token}broken`;

    await expect(decodeSessionToken(tampered)).resolves.toBeNull();
  });

  test('rejects an invalid session payload before encoding', async () => {
    await expect(
      encodeSessionToken({
        email: 'not-an-email',
        name: '  ',
        role: 'admin',
      }),
    ).rejects.toThrow();
  });

  test('returns null for an invalid token format', async () => {
    await expect(decodeSessionToken('not-a-token')).resolves.toBeNull();
  });
});

describe('cookie-session-gateway', () => {
  test('issues a validated session cookie descriptor', async () => {
    const gateway = new CookieSessionGateway();

    await expect(
      gateway.issue({
        email: 'Admin@Example.com',
        name: 'Control Room Admin',
        role: 'admin',
      }),
    ).resolves.toMatchObject({
      name: SESSION_COOKIE_NAME,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      },
    });
  });

  test('clears the session cookie with a validated descriptor', async () => {
    const gateway = new CookieSessionGateway();

    await expect(gateway.clear()).resolves.toEqual({
      name: SESSION_COOKIE_NAME,
      value: '',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/',
        maxAge: 0,
      },
    });
  });
});
