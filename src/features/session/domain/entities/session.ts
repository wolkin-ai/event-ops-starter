export type SessionRole = 'attendee' | 'admin';

export interface Session {
  readonly email: string;
  readonly name: string;
  readonly role: SessionRole;
}

export interface SessionCookieDescriptor {
  readonly name: string;
  readonly value: string;
  readonly options: {
    readonly httpOnly: boolean;
    readonly sameSite: 'lax';
    readonly secure: boolean;
    readonly path: string;
    readonly maxAge: number;
  };
}
