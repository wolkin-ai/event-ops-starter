'use client';

import { useRouter } from 'next/navigation';

import { AdminEventForm } from '@/components/admin/admin-event-form';

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
        const payload = (await response.json()) as {
          readonly error?: string;
          readonly reference?: string;
        };

        if (!response.ok || !payload.reference) {
          throw new Error(payload.error ?? 'Event creation failed.');
        }

        return {
          reference: payload.reference,
        };
      }}
      onCompleted={() => {
        router.push('/admin/events?created=1');
        router.refresh();
      }}
    />
  );
}
