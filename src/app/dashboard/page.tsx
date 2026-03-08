import { redirect } from 'next/navigation';

import { createCatalogServices } from '@/composition/catalog';
import { createRegistrationServices } from '@/composition/registration';
import { createSessionServices } from '@/composition/session';
import { DashboardRegistrations } from '@/components/public/dashboard-registrations';
import { SiteHeader } from '@/components/public/site-header';
import { createLoginPath } from '@/features/session/application/create-login-path';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { getCurrentSession } = createSessionServices();
  const session = await getCurrentSession.execute();

  if (!session || (session.role !== 'attendee' && session.role !== 'admin')) {
    redirect(createLoginPath('/dashboard', 'attendee'));
  }

  const { listRegistrations } = createRegistrationServices();
  const { listPublicEvents } = createCatalogServices();
  const [registrations, events] = await Promise.all([
    listRegistrations.execute({ attendeeEmail: session.email }),
    listPublicEvents.execute(),
  ]);
  const eventMap = new Map(events.map((event) => [event.id, event]));
  const cards = registrations.map((registration) => ({
    id: registration.id,
    attendeeName: registration.attendeeName,
    company: registration.company,
    seatCount: registration.seatCount,
    status: registration.status,
    eventTitle:
      eventMap.get(registration.eventId)?.title ?? registration.eventId,
    startsAt: eventMap.get(registration.eventId)?.schedule.startsAt ?? null,
  }));

  return (
    <div className="public-page">
      <SiteHeader />
      <main className="container section-stack">
        <section className="section-heading">
          <p className="eyebrow">Attendee dashboard</p>
          <h1 className="section-title">
            A personal view backed by the same Prisma registration flow.
          </h1>
        </section>
        <DashboardRegistrations registrations={cards} />
      </main>
    </div>
  );
}
