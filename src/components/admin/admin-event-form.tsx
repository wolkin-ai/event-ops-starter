'use client';

import { useState, useTransition } from 'react';

import type { CreateAdminEventInput } from '@/features/admin-events/application/usecases/create-admin-event-usecase';

interface AdminEventFormProps {
  readonly onSubmit: (input: CreateAdminEventInput) => Promise<{
    readonly reference: string;
  }>;
  readonly onCompleted?: () => void;
}

export function AdminEventForm({ onSubmit, onCompleted }: AdminEventFormProps) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState('');
  const [city, setCity] = useState('Tokyo');
  const [venue, setVenue] = useState('');
  const [startsAt, setStartsAt] = useState('2026-09-03T10:00');
  const [capacity, setCapacity] = useState('120');
  const [track, setTrack] = useState('Summit');
  const [summary, setSummary] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    startTransition(async () => {
      try {
        const result = await onSubmit({
          title,
          city,
          venue,
          startsAt,
          capacity: Number(capacity),
          track,
          summary,
        });

        setSuccessMessage(`Event drafted. Ref ${result.reference}.`);
        onCompleted?.();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Event creation failed.',
        );
      }
    });
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="stack-sm">
        <p className="eyebrow">Admin reference slice</p>
        <h1 className="section-title">
          Create an event without touching infrastructure details.
        </h1>
        <p className="body-copy">
          The UI remains in the admin layer. Validation and persistence flow
          through application use cases and an admin-plan adapter. Public
          publication stays decoupled on purpose and must be triggered
          explicitly after the draft is reviewed.
        </p>
      </div>

      {successMessage ? (
        <p className="success-banner">{successMessage}</p>
      ) : null}
      {errorMessage ? <p className="error-banner">{errorMessage}</p> : null}

      <div className="form-grid">
        <label className="field">
          <span className="field-label">Title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">City</span>
          <input
            value={city}
            onChange={(event) => setCity(event.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">Venue</span>
          <input
            value={venue}
            onChange={(event) => setVenue(event.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">Start time</span>
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(event) => setStartsAt(event.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">Capacity</span>
          <input
            type="number"
            min="1"
            value={capacity}
            onChange={(event) => setCapacity(event.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">Track</span>
          <input
            value={track}
            onChange={(event) => setTrack(event.target.value)}
          />
        </label>
        <label className="field full">
          <span className="field-label">Summary</span>
          <textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
          />
        </label>
      </div>

      <button className="button" type="submit" disabled={isPending}>
        {isPending ? 'Creating…' : 'Create event'}
      </button>
    </form>
  );
}
