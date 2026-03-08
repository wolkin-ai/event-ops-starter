'use client';

import { useState, useTransition } from 'react';

import type { CreateRegistrationInput } from '@/features/registration/application/usecases/create-registration-usecase';

interface RegistrationFormProps {
  readonly eventId: string;
  readonly eventTitle: string;
  readonly onSubmit: (input: CreateRegistrationInput) => Promise<{
    readonly reference: string;
  }>;
  readonly onCompleted?: () => void;
}

export function RegistrationForm({
  eventId,
  eventTitle,
  onSubmit,
  onCompleted,
}: RegistrationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [company, setCompany] = useState('');
  const [seatCount, setSeatCount] = useState('1');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    startTransition(async () => {
      try {
        const result = await onSubmit({
          eventId,
          attendeeName,
          attendeeEmail,
          company,
          seatCount: Number(seatCount),
          notes,
        });

        setSuccessMessage(
          `Registration confirmed for ${eventTitle}. Ref ${result.reference}.`,
        );
        setAttendeeName('');
        setAttendeeEmail('');
        setCompany('');
        setSeatCount('1');
        setNotes('');
        onCompleted?.();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Registration failed.',
        );
      }
    });
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="stack-sm">
        <p className="eyebrow">Reserve a seat</p>
        <h2 className="section-title">{eventTitle}</h2>
        <p className="body-copy">
          This starter keeps the public promise intentionally simple: review the
          event, register once, and inspect the result in the attendee
          dashboard.
        </p>
      </div>

      {successMessage ? (
        <p className="success-banner">{successMessage}</p>
      ) : null}
      {errorMessage ? <p className="error-banner">{errorMessage}</p> : null}

      <div className="form-grid">
        <label className="field">
          <span className="field-label">Full name</span>
          <input
            value={attendeeName}
            onChange={(event) => setAttendeeName(event.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">Work email</span>
          <input
            type="email"
            value={attendeeEmail}
            onChange={(event) => setAttendeeEmail(event.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">Company</span>
          <input
            value={company}
            onChange={(event) => setCompany(event.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">Seats</span>
          <select
            value={seatCount}
            onChange={(event) => setSeatCount(event.target.value)}
          >
            <option value="1">1 seat</option>
            <option value="2">2 seats</option>
            <option value="3">3 seats</option>
          </select>
        </label>
        <label className="field full">
          <span className="field-label">Notes</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>
      </div>

      <button className="button" type="submit" disabled={isPending}>
        {isPending ? 'Reserving…' : 'Reserve seat'}
      </button>
    </form>
  );
}
