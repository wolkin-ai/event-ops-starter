'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';

import type { UpdateAdminEventPublicationInput } from '@/features/admin-events/application/usecases/update-admin-event-publication-usecase';
import type { AdminEventPublication } from '@/features/admin-events/domain/entities/admin-event-publication';
import { formatEventDate } from '@/lib/format-date';

interface AdminPublicationFormProps {
  readonly publication: AdminEventPublication;
  readonly onSubmit: (input: UpdateAdminEventPublicationInput) => Promise<void>;
}

function linesToText(items: readonly string[]) {
  return items.join('\n');
}

function textToLines(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function AdminPublicationForm({
  publication,
  onSubmit,
}: AdminPublicationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(publication.title);
  const [summary, setSummary] = useState(publication.summary);
  const [heroEyebrow, setHeroEyebrow] = useState(publication.heroEyebrow);
  const [heroBlurb, setHeroBlurb] = useState(publication.heroBlurb);
  const [audience, setAudience] = useState(publication.audience);
  const [trackLabel, setTrackLabel] = useState(publication.trackLabel);
  const [highlights, setHighlights] = useState(
    linesToText(publication.highlights),
  );
  const [operatorNotes, setOperatorNotes] = useState(
    linesToText(publication.operatorNotes),
  );
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    startTransition(async () => {
      try {
        await onSubmit({
          eventId: publication.eventId,
          title,
          summary,
          heroEyebrow,
          heroBlurb,
          audience,
          trackLabel,
          highlights: textToLines(highlights),
          operatorNotes: textToLines(operatorNotes),
        });
        setSuccessMessage('Public copy updated.');
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Publication update failed.',
        );
      }
    });
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="stack-sm">
        <p className="eyebrow">Publication editor</p>
        <h1 className="section-title">
          Edit the public-facing copy explicitly.
        </h1>
        <p className="body-copy">
          EventPlan keeps operational data. This form edits only the public
          projection that visitors see.
        </p>
      </div>

      <div className="button-row">
        <span className="status-pill">{publication.publicationStatus}</span>
        <span className="badge">{formatEventDate(publication.startsAt)}</span>
        <span className="badge">{publication.venue}</span>
        <span className="badge">{publication.seatsRemaining} seats left</span>
        <Link
          href={`/events/${publication.slug}`}
          className="button button-ghost button-compact"
        >
          Open public page
        </Link>
      </div>

      {successMessage ? (
        <p className="success-banner">{successMessage}</p>
      ) : null}
      {errorMessage ? <p className="error-banner">{errorMessage}</p> : null}

      <div className="form-grid">
        <label className="field">
          <span className="field-label">Public title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">Hero eyebrow</span>
          <input
            value={heroEyebrow}
            onChange={(event) => setHeroEyebrow(event.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">Audience</span>
          <input
            value={audience}
            onChange={(event) => setAudience(event.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">Track label</span>
          <input
            value={trackLabel}
            onChange={(event) => setTrackLabel(event.target.value)}
          />
        </label>
        <label className="field full">
          <span className="field-label">Public summary</span>
          <textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
          />
        </label>
        <label className="field full">
          <span className="field-label">Hero blurb</span>
          <textarea
            value={heroBlurb}
            onChange={(event) => setHeroBlurb(event.target.value)}
          />
        </label>
        <label className="field full">
          <span className="field-label">Highlights (one per line)</span>
          <textarea
            value={highlights}
            onChange={(event) => setHighlights(event.target.value)}
          />
        </label>
        <label className="field full">
          <span className="field-label">Operator notes (one per line)</span>
          <textarea
            value={operatorNotes}
            onChange={(event) => setOperatorNotes(event.target.value)}
          />
        </label>
      </div>

      <button className="button" type="submit" disabled={isPending}>
        {isPending ? 'Saving…' : 'Save public copy'}
      </button>
    </form>
  );
}
