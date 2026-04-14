import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    role?: 'attendee' | 'admin';
  }

  interface Session {
    user: {
      role?: 'attendee' | 'admin';
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'attendee' | 'admin';
  }
}
