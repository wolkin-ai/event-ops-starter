import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

import type { SessionRole } from '@/features/session/domain/entities/session';

const demoSignInSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  role: z.enum(['attendee', 'admin']),
});

function normalizeRole(value: string): SessionRole | undefined {
  return value === 'admin' || value === 'attendee' ? value : undefined;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: 'jwt',
  },
  providers: [
    Credentials({
      name: 'Demo role sign-in',
      credentials: {
        name: {
          label: 'Name',
          type: 'text',
        },
        email: {
          label: 'Email',
          type: 'email',
        },
        role: {
          label: 'Role',
          type: 'text',
        },
      },
      async authorize(credentials) {
        const parsed = demoSignInSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const role = normalizeRole(parsed.data.role);

        if (role === undefined) {
          return null;
        }

        return {
          id: parsed.data.email.toLowerCase(),
          name: parsed.data.name,
          email: parsed.data.email.toLowerCase(),
          role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      token.name = user.name;
      token.email = user.email;
      token.role =
        typeof user.role === 'string' ? normalizeRole(user.role) : undefined;

      return token;
    },
    async session({ session, token }) {
      session.user.name =
        typeof token.name === 'string' ? token.name : session.user.name;
      session.user.email =
        typeof token.email === 'string' ? token.email : session.user.email;
      session.user.role =
        typeof token.role === 'string'
          ? normalizeRole(token.role)
          : undefined;

      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});
