import type {
  Session,
  SessionCookieDescriptor,
} from '@/features/session/domain/entities/session';
import { z } from 'zod';

const sessionSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),
  name: z.string().trim().min(1),
  role: z.enum(['attendee', 'admin']),
});

const storedSessionSchema = sessionSchema.extend({
  issuedAt: z.string().datetime({ offset: true }),
});

const sessionTokenSchema = z.string().regex(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);

const sessionCookieDescriptorSchema = z.object({
  name: z.string().min(1),
  value: z.string(),
  options: z.object({
    httpOnly: z.literal(true),
    sameSite: z.literal('lax'),
    secure: z.boolean(),
    path: z.literal('/'),
    maxAge: z.number().int().min(0),
  }),
});

export interface StoredSession extends Session {
  readonly issuedAt: string;
}

export function parseSession(session: Session): Session {
  return sessionSchema.parse(session);
}

export function parseStoredSession(session: unknown): StoredSession {
  return storedSessionSchema.parse(session);
}

export function parseSessionToken(token: string): string {
  return sessionTokenSchema.parse(token);
}

export function isSessionToken(token: string): boolean {
  return sessionTokenSchema.safeParse(token).success;
}

export function parseSessionCookieDescriptor(
  descriptor: SessionCookieDescriptor,
): SessionCookieDescriptor {
  return sessionCookieDescriptorSchema.parse(descriptor);
}
