import { SiteHeader } from '@/components/public/site-header';
import { SessionLoginForm } from '@/components/shared/session-login-form';

interface LoginPageProps {
  readonly searchParams: Promise<{
    readonly next?: string;
    readonly role?: 'attendee' | 'admin';
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const defaultRole = params.role === 'admin' ? 'admin' : 'attendee';

  return (
    <div className="public-page">
      <SiteHeader />
      <main className="container section-stack">
        <section className="split-grid">
          <div className="panel stack-md">
            <p className="eyebrow">Auth.js boundary</p>
            <h1 className="section-title">
              Use Auth.js-backed demo credentials before entering attendee or
              admin routes.
            </h1>
            <p className="body-copy">
              This starter now uses Auth.js JWT sessions so the same login
              boundary can run locally on PostgreSQL and deploy to Vercel
              without a custom cookie implementation.
            </p>
            <ul className="note-list">
              <li>
                <code>attendee</code> can open the personal registration
                dashboard.
              </li>
              <li>
                <code>admin</code> can open the control-room routes and create
                events.
              </li>
              <li>
                Demo roles still keep the UX lightweight, but session transport
                is now the hosted-ready Auth.js path.
              </li>
            </ul>
          </div>
          <SessionLoginForm
            defaultRole={defaultRole}
            nextPath={params.next ?? null}
          />
        </section>
      </main>
    </div>
  );
}
