import Link from 'next/link';
import { redirect } from 'next/navigation';

import { createAdminEventServices } from '@/composition/admin-events';
import { createSessionServices } from '@/composition/session';
import { AdminHeader } from '@/components/admin/admin-header';
import { AdminPublicationEditorShell } from '@/components/admin/admin-publication-editor-shell';
import { createLoginPath } from '@/features/session/application/create-login-path';

interface AdminEventPublicationPageProps {
  readonly params: Promise<{
    readonly eventId: string;
  }>;
}

export default async function AdminEventPublicationPage({
  params,
}: AdminEventPublicationPageProps) {
  const { eventId } = await params;
  const { getCurrentSession } = createSessionServices();
  const session = await getCurrentSession.execute();

  if (!session || session.role !== 'admin') {
    redirect(createLoginPath(`/admin/events/${eventId}/publication`, 'admin'));
  }
  const { getAdminEventPublication } = createAdminEventServices();
  const publication = await getAdminEventPublication.execute(eventId);

  return (
    <div className="admin-page">
      <AdminHeader />
      <main className="container section-stack">
        {publication ? (
          <AdminPublicationEditorShell publication={publication} />
        ) : (
          <section className="empty-state">
            <p className="eyebrow">Publication editor</p>
            <h1 className="section-title">
              Publish the event once before editing public copy.
            </h1>
            <p className="body-copy">
              A public projection does not exist yet for this plan. This is
              intentional: creating a plan does not auto-publish it.
            </p>
            <div className="button-row">
              <Link href="/admin/events" className="button">
                Back to event board
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
