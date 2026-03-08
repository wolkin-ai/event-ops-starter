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
            <p className="eyebrow">Session boundary</p>
            <h1 className="section-title">
              Use a lightweight role session before entering attendee or admin
              routes.
            </h1>
            <p className="body-copy">
              This starter uses a signed session cookie so teams can evaluate
              route protection and role-aware flows without wiring a full
              identity provider on day one.
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
                The session layer is intentionally small so Auth.js can replace
                it later.
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
