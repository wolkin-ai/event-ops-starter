'use client';

import type { AdminEventPublication } from '@/features/admin-events/domain/entities/admin-event-publication';

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
        const payload = (await response.json()) as {
          readonly error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error ?? 'Publication update failed.');
        }
      }}
    />
  );
}
