import type { Session } from '@/features/session/domain/entities/session';

import {
  isSessionToken,
  parseSession,
  parseStoredSession,
} from '@/features/session/infrastructure/adapters/session-contract';

const SESSION_SECRET =
  process.env.AUTH_SECRET ??
  process.env.SESSION_SECRET ??
  'event-ops-starter-dev-session-secret';

function toBase64Url(bytes: Uint8Array) {
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(`${normalized}${padding}`);

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function signValue(value: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(SESSION_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(value),
  );

  return toBase64Url(new Uint8Array(signature));
}

export async function encodeSessionToken(session: Session) {
  const normalizedSession = parseSession(session);
  const body = {
    ...normalizedSession,
    issuedAt: new Date().toISOString(),
  };
  const serialized = JSON.stringify(body);
  const encodedPayload = toBase64Url(new TextEncoder().encode(serialized));
  const signature = await signValue(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export async function decodeSessionToken(token: string) {
  if (!isSessionToken(token)) {
    return null;
  }

  const separatorIndex = token.indexOf('.');
  const encodedPayload = token.slice(0, separatorIndex);
  const providedSignature = token.slice(separatorIndex + 1);

  const expectedSignature = await signValue(encodedPayload);

  if (expectedSignature !== providedSignature) {
    return null;
  }

  try {
    const parsed = parseStoredSession(
      JSON.parse(new TextDecoder().decode(fromBase64Url(encodedPayload))),
    );

    return {
      email: parsed.email,
      name: parsed.name,
      role: parsed.role,
    } satisfies Session;
  } catch {
    return null;
  }
}
