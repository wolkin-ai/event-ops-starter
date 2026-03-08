import { redirect } from 'next/navigation';

import { AdminAttendeeList } from '@/components/admin/admin-attendee-list';
import { AdminHeader } from '@/components/admin/admin-header';
import { createCatalogServices } from '@/composition/catalog';
import { createRegistrationServices } from '@/composition/registration';
import { createSessionServices } from '@/composition/session';
import { createLoginPath } from '@/features/session/application/create-login-path';

export const dynamic = 'force-dynamic';

export default async function AdminAttendeesPage() {
  const { getCurrentSession } = createSessionServices();
  const session = await getCurrentSession.execute();

  if (!session || session.role !== 'admin') {
    redirect(createLoginPath('/admin/attendees', 'admin'));
  }

  const { listRegistrations } = createRegistrationServices();
  const { listPublicEvents } = createCatalogServices();
  const [registrations, events] = await Promise.all([
    listRegistrations.execute(),
    listPublicEvents.execute(),
  ]);
  const eventMap = new Map(events.map((event) => [event.id, event]));
  const attendeeRows = registrations.map((registration) => ({
    id: registration.id,
    attendeeName: registration.attendeeName,
    attendeeEmail: registration.attendeeEmail,
    company: registration.company,
    seatCount: registration.seatCount,
    status: registration.status,
    createdAt: registration.createdAt,
    eventTitle:
      eventMap.get(registration.eventId)?.title ?? registration.eventId,
  }));

  return (
    <div className="admin-page">
      <AdminHeader />
      <main className="container section-stack">
        <section className="section-heading">
          <p className="eyebrow">Admin expansion slice</p>
          <h1 className="section-title">Attendee list</h1>
          <p className="lead">
            A second admin slice for dense operational review: attendee names,
            seat counts, and registration timestamps in one place.
          </p>
        </section>
        <AdminAttendeeList attendees={attendeeRows} />
      </main>
    </div>
  );
}
