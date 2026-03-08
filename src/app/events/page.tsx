import { createCatalogServices } from '@/composition/catalog';
import { EventCard } from '@/components/public/event-card';
import { SiteHeader } from '@/components/public/site-header';

export const dynamic = 'force-dynamic';

export default async function EventsPage() {
  const { listPublicEvents } = createCatalogServices();
  const events = await listPublicEvents.execute();

  return (
    <div className="public-page">
      <SiteHeader />
      <main className="container section-stack">
        <section className="section-block">
          <div className="section-heading">
            <p className="eyebrow">Event catalog</p>
            <h1 className="section-title">
              A clean public list page that stays aligned with the admin model.
            </h1>
            <p className="lead">
              These cards are intentionally marketing-friendly. The underlying
              IDs and statuses stay domain-safe in the application layer.
            </p>
          </div>
          <div className="card-grid">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
