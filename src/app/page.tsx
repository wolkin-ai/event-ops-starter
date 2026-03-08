import Link from 'next/link';

import { createCatalogServices } from '@/composition/catalog';
import { EventCard } from '@/components/public/event-card';
import { SiteHeader } from '@/components/public/site-header';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { listPublicEvents } = createCatalogServices();
  const events = await listPublicEvents.execute();
  const featuredEvents = events.slice(0, 3);

  return (
    <div className="public-page">
      <SiteHeader />
      <main className="container section-stack">
        <section className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">AI-ready public + admin starter</p>
            <h1 className="display-title">
              Run a launch-worthy event brand and a calm operator dashboard from
              the same system.
            </h1>
            <p className="lead">
              Event Ops Starter demonstrates how Storybook-first UI, DDD
              language gates, and review automation can ship a public event
              journey and an admin console together.
            </p>
            <div className="button-row">
              <Link href="/events/signal-summit-tokyo" className="button">
                Open reference slice
              </Link>
              <Link href="/admin/events" className="button button-secondary">
                View admin board
              </Link>
              <Link href="/login?role=admin" className="button button-ghost">
                Test auth boundary
              </Link>
            </div>
          </div>
          <aside className="hero-panel">
            <div className="metric-strip">
              <div>
                <span className="metric-label">Public flow</span>
                <strong>Event detail → registration</strong>
              </div>
              <div>
                <span className="metric-label">Admin flow</span>
                <strong>Event list → create event</strong>
              </div>
            </div>
            <ul className="timeline-list">
              <li>Storybook reviewable states for public and admin UI.</li>
              <li>DDD naming gate before code-level domain expansion.</li>
              <li>
                Codex review wrappers for architecture, security, and
                performance.
              </li>
            </ul>
          </aside>
        </section>

        <section className="section-block">
          <div className="section-heading">
            <p className="eyebrow">Featured events</p>
            <h2 className="section-title">
              Reference public pages with enough visual depth to review.
            </h2>
          </div>
          <div className="card-grid">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>

        <section className="section-block split-grid">
          <div className="panel">
            <p className="eyebrow">Why this starter exists</p>
            <h2 className="section-title">
              A shared language between business review and domain design.
            </h2>
            <p className="body-copy">
              The public UI is expressive enough for stakeholder review. The
              admin UI stays dense enough to stress real operations. Both are
              backed by a small but explicit domain layer that keeps naming
              drift under control.
            </p>
          </div>
          <div className="panel">
            <p className="eyebrow">What ships on day one</p>
            <ul className="note-list">
              <li>
                Landing page, event list, event detail, registration, attendee
                dashboard.
              </li>
              <li>Admin dashboard, event list, event create flow.</li>
              <li>
                Project-local skills, Codex review wrappers, and validation
                scripts.
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
