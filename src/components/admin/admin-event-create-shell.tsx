'use client';

import { useRouter } from 'next/navigation';

import { AdminEventForm } from '@/components/admin/admin-event-form';
import {
  readErrorMessage,
  readJsonObject,
  readRequiredString,
} from '@/lib/http/client-response';

export function AdminEventCreateShell() {
  const router = useRouter();

  return (
    <AdminEventForm
      onSubmit={async (input) => {
        const response = await fetch('/api/admin/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(input),
        });
        const payload = await readJsonObject(
          response,
          'Event creation failed.',
        );

        if (!response.ok) {
          throw new Error(readErrorMessage(payload, 'Event creation failed.'));
        }

        return {
          reference: readRequiredString(
            payload,
            'reference',
            'Event creation failed.',
          ),
        };
      }}
      onCompleted={() => {
        router.push('/admin/events?created=1');
        router.refresh();
      }}
    />
  );
}
