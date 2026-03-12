import type { Session } from '@/features/session/domain/entities/session';
import { z } from 'zod';

interface StoredSession extends Session {
  readonly issuedAt: string;
}

const storedSessionSchema = z.object({
  email: z.string(),
  name: z.string(),
  role: z.enum(['attendee', 'admin']),
  issuedAt: z.string(),
});

const SESSION_SECRET =
  process.env.SESSION_SECRET ?? 'event-ops-starter-dev-session-secret';

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
  const body: StoredSession = {
    ...session,
    email: session.email.trim().toLowerCase(),
    name: session.name.trim(),
    issuedAt: new Date().toISOString(),
  };
  const serialized = JSON.stringify(body);
  const encodedPayload = toBase64Url(new TextEncoder().encode(serialized));
  const signature = await signValue(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export async function decodeSessionToken(token: string) {
  const [encodedPayload, providedSignature] = token.split('.');

  if (!encodedPayload || !providedSignature) {
    return null;
  }

  const expectedSignature = await signValue(encodedPayload);

  if (expectedSignature !== providedSignature) {
    return null;
  }

  try {
    const parsed = storedSessionSchema.safeParse(
      JSON.parse(new TextDecoder().decode(fromBase64Url(encodedPayload))),
    );

    if (!parsed.success) {
      return null;
    }

    return {
      email: parsed.data.email,
      name: parsed.data.name,
      role: parsed.data.role,
    } satisfies Session;
  } catch {
    return null;
  }
}
