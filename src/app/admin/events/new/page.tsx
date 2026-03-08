import { redirect } from 'next/navigation';

import { createSessionServices } from '@/composition/session';
import { AdminEventCreateShell } from '@/components/admin/admin-event-create-shell';
import { AdminHeader } from '@/components/admin/admin-header';
import { createLoginPath } from '@/features/session/application/create-login-path';

export default async function AdminEventCreatePage() {
  const { getCurrentSession } = createSessionServices();
  const session = await getCurrentSession.execute();

  if (!session || session.role !== 'admin') {
    redirect(createLoginPath('/admin/events/new', 'admin'));
  }

  return (
    <div className="admin-page">
      <AdminHeader />
      <main className="container section-stack">
        <AdminEventCreateShell />
      </main>
    </div>
  );
}
