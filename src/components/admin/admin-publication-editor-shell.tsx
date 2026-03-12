'use client';

import type { AdminEventPublication } from '@/features/admin-events/domain/entities/admin-event-publication';
import { readErrorMessage, readJsonObject } from '@/lib/http/client-response';

import { AdminPublicationForm } from './admin-publication-form';

interface AdminPublicationEditorShellProps {
  readonly publication: AdminEventPublication;
}

export function AdminPublicationEditorShell({
  publication,
}: AdminPublicationEditorShellProps) {
  return (
    <AdminPublicationForm
      publication={publication}
      onSubmit={async (input) => {
        const response = await fetch(
          `/api/admin/events/${publication.eventId}/publication`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
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
      }}
    />
  );
}
