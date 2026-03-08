import { describe, expect, test } from 'vitest';

import {
  decodeSessionToken,
  encodeSessionToken,
} from '@/features/session/infrastructure/adapters/session-token-codec';

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
});
