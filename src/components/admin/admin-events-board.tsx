'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import type { AdminEvent } from '@/features/admin-events/domain/entities/admin-event';
import { readErrorMessage, readJsonObject } from '@/lib/http/client-response';

import { AdminEventList } from './admin-event-list';

interface AdminEventsBoardProps {
  readonly showCreatedBanner: boolean;
  readonly events: readonly AdminEvent[];
}

export function AdminEventsBoard({
  showCreatedBanner,
  events,
}: AdminEventsBoardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  function updatePublication(eventId: string, method: 'POST' | 'DELETE') {
    setSuccessMessage('');
    setErrorMessage('');
    setActiveEventId(eventId);

    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/admin/events/${eventId}/publication`,
          {
            method,
          },
        );
        const payload = await readJsonObject(
          response,
          'Publication update failed.',
        );

        if (!response.ok) {
          throw new Error(
            readErrorMessage(payload, 'Publication update failed.'),
          );
        }

        setSuccessMessage(
          method === 'POST'
            ? 'Event published to the public catalog.'
            : 'Event publication withdrawn from the public catalog.',
        );
        router.refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Publication update failed.',
        );
      } finally {
        setActiveEventId(null);
      }
    });
  }

  return (
    <>
      {showCreatedBanner ? (
        <p className="success-banner">Event created and added to the board.</p>
      ) : null}
      {successMessage ? (
        <p className="success-banner">{successMessage}</p>
      ) : null}
      {errorMessage ? <p className="error-banner">{errorMessage}</p> : null}
      <AdminEventList
        events={events}
        pendingEventId={isPending ? activeEventId : null}
        onPublish={(eventId) => updatePublication(eventId, 'POST')}
        onUnpublish={(eventId) => updatePublication(eventId, 'DELETE')}
      />
    </>
  );
}
