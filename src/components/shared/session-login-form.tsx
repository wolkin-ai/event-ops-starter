'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import type { SessionRole } from '@/features/session/domain/entities/session';
import {
  readErrorMessage,
  readJsonObject,
  readRequiredString,
} from '@/lib/http/client-response';

interface SessionLoginFormProps {
  readonly defaultRole: SessionRole;
  readonly nextPath: string | null;
}

const demoUsers: Record<
  SessionRole,
  {
    readonly name: string;
    readonly email: string;
  }
> = {
  attendee: {
    name: 'Aki Ito',
    email: 'aki@example.com',
  },
  admin: {
    name: 'Control Room Admin',
    email: 'admin@eventops.local',
  },
};

export function SessionLoginForm({
  defaultRole,
  nextPath,
}: SessionLoginFormProps) {
  const router = useRouter();
  const [role, setRole] = useState<SessionRole>(defaultRole);
  const [name, setName] = useState(demoUsers[defaultRole].name);
  const [email, setEmail] = useState(demoUsers[defaultRole].email);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  function applyRole(nextRole: SessionRole) {
    setRole(nextRole);
    setName(demoUsers[nextRole].name);
    setEmail(demoUsers[nextRole].email);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');

    startTransition(async () => {
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          role,
          nextPath,
        }),
      });
      const payload = await readJsonObject(response, 'Sign in failed.');

      if (!response.ok) {
        setErrorMessage(readErrorMessage(payload, 'Sign in failed.'));
        return;
      }

      router.push(readRequiredString(payload, 'redirectTo', 'Sign in failed.'));
      router.refresh();
    });
  }

  return (
    <form className="form-card login-card" onSubmit={handleSubmit}>
      <div className="stack-sm">
        <p className="eyebrow">Demo sign-in</p>
        <h2 className="section-title">Create a session for the next route.</h2>
        <p className="body-copy">
          Choose the role you want to test. The cookie is local to this starter
          and can be overwritten by signing in again.
        </p>
      </div>

      {errorMessage ? <p className="error-banner">{errorMessage}</p> : null}

      <div className="button-row" role="tablist" aria-label="Role">
        <button
          className={role === 'attendee' ? 'button' : 'button button-secondary'}
          type="button"
          onClick={() => applyRole('attendee')}
        >
          Attendee
        </button>
        <button
          className={role === 'admin' ? 'button' : 'button button-secondary'}
          type="button"
          onClick={() => applyRole('admin')}
        >
          Admin
        </button>
      </div>

      <div className="form-grid">
        <label className="field">
          <span className="field-label">Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
      </div>

      <button className="button" type="submit" disabled={isPending}>
        {isPending ? 'Creating session…' : `Continue as ${role}`}
      </button>
    </form>
  );
}
