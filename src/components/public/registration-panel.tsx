'use client';

import type { PublicEvent } from '@/features/catalog/domain/entities/public-event';
import { formatEventDate } from '@/lib/format-date';

import { RegistrationForm } from './registration-form';

interface RegistrationPanelProps {
  readonly event: PublicEvent;
}

export function RegistrationPanel({ event }: RegistrationPanelProps) {
  return (
    <div className="detail-grid">
      <section className="detail-panel">
        <p className="eyebrow">{event.heroEyebrow}</p>
        <h1 className="detail-title">{event.title}</h1>
        <p className="detail-copy">{event.heroBlurb}</p>
        <div className="meta-row">
          <span className="badge">
            {formatEventDate(event.schedule.startsAt)}
          </span>
          <span className="badge">{event.venue}</span>
          <span className="badge">{event.seatsRemaining} seats left</span>
        </div>
        <ul className="note-list">
          {event.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      </section>
      <RegistrationForm
        eventId={event.id}
        eventTitle={event.title}
        onSubmit={async (input) => {
          const response = await fetch('/api/registrations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
          });
          const payload = (await response.json()) as {
            readonly error?: string;
            readonly reference?: string;
          };

          if (!response.ok || !payload.reference) {
            throw new Error(payload.error ?? 'Registration failed.');
          }

          return {
            reference: payload.reference,
          };
        }}
      />
    </div>
  );
}
