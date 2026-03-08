import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AdminHeader } from '@/components/admin/admin-header';
import { createAdminEventServices } from '@/composition/admin-events';
import { createCatalogServices } from '@/composition/catalog';
import { createRegistrationServices } from '@/composition/registration';
import { createSessionServices } from '@/composition/session';
import { createLoginPath } from '@/features/session/application/create-login-path';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const { getCurrentSession } = createSessionServices();
  const session = await getCurrentSession.execute();

  if (!session || session.role !== 'admin') {
    redirect(createLoginPath('/admin', 'admin'));
  }

  const { listAdminEvents } = createAdminEventServices();
  const { listPublicEvents } = createCatalogServices();
  const { listRegistrations } = createRegistrationServices();
  const [adminEvents, publicEvents, registrations] = await Promise.all([
    listAdminEvents.execute(),
    listPublicEvents.execute(),
    listRegistrations.execute(),
  ]);

  return (
    <div className="admin-page">
      <AdminHeader />
      <main className="container section-stack">
        <section className="section-heading">
          <p className="eyebrow">Operations dashboard</p>
          <h1 className="section-title">
            An admin shell that assumes operators need density, not decoration.
          </h1>
          <p className="lead">
            This starter does not ship a generic SaaS dashboard. It uses a
            control-room tone, dense cards, and explicit event status language.
          </p>
        </section>
        <section className="metric-grid">
          <article className="metric-card">
            <span className="metric-label">Live publications</span>
            <strong>{publicEvents.length}</strong>
            <p className="status-copy">
              Public routes reading from the publication projection only.
            </p>
          </article>
          <article className="metric-card">
            <span className="metric-label">Admin events</span>
            <strong>{adminEvents.length}</strong>
            <p className="status-copy">
              Includes seeded items and newly created records.
            </p>
          </article>
          <article className="metric-card">
            <span className="metric-label">Registrations</span>
            <strong>{registrations.length}</strong>
            <p className="status-copy">
              Confirms the attendee dashboard and admin attendee slice.
            </p>
          </article>
        </section>
        <section className="split-grid">
          <div className="panel">
            <p className="eyebrow">Primary actions</p>
            <div className="button-row">
              <Link href="/admin/events" className="button button-ghost">
                Open event board
              </Link>
              <Link href="/admin/events/new" className="button">
                Create new event
              </Link>
              <Link href="/admin/attendees" className="button button-ghost">
                Review attendees
              </Link>
            </div>
          </div>
          <div className="panel">
            <p className="eyebrow">Review model</p>
            <ul className="note-list">
              <li>
                Storybook validates the public look and the admin controls.
              </li>
              <li>Use cases own validation, not page files.</li>
              <li>
                Codex review wrappers can run architecture, security, and
                performance checks.
              </li>
              <li>
                Signed sessions gate admin routes without adding vendor lock-in.
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
