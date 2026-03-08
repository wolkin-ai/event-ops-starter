import Link from 'next/link';
import { redirect } from 'next/navigation';

import { createAdminEventServices } from '@/composition/admin-events';
import { AdminEventsBoard } from '@/components/admin/admin-events-board';
import { AdminHeader } from '@/components/admin/admin-header';
import { createSessionServices } from '@/composition/session';
import { createLoginPath } from '@/features/session/application/create-login-path';

interface AdminEventsPageProps {
  readonly searchParams: Promise<{
    readonly created?: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function AdminEventsPage({
  searchParams,
}: AdminEventsPageProps) {
  const { getCurrentSession } = createSessionServices();
  const session = await getCurrentSession.execute();

  if (!session || session.role !== 'admin') {
    redirect(createLoginPath('/admin/events', 'admin'));
  }

  const params = await searchParams;
  const { listAdminEvents } = createAdminEventServices();
  const events = await listAdminEvents.execute();

  return (
    <div className="admin-page">
      <AdminHeader />
      <main className="container section-stack">
        <section className="section-heading">
          <p className="eyebrow">Admin reference slice</p>
          <h1 className="section-title">Event board</h1>
          <p className="lead">
            Admin event plans persist immediately, but public catalog entries
            remain a separate projection. Operators publish and withdraw that
            projection explicitly, so planning and public visibility can evolve
            independently later. Public copy editing then happens on the
            publication path, not on the plan form.
          </p>
        </section>
        <div className="button-row">
          <Link href="/admin/events/new" className="button">
            Create event
          </Link>
          <Link href="/admin/attendees" className="button button-ghost">
            View attendees
          </Link>
        </div>
        <AdminEventsBoard
          showCreatedBanner={params.created === '1'}
          events={events}
        />
      </main>
    </div>
  );
}
