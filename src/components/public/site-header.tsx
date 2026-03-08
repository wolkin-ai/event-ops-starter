import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand-lockup">
          <span className="brand-mark">EO</span>
          <span className="brand-copy">
            <strong>Event Ops Starter</strong>
            <span>Public journey + admin command center</span>
          </span>
        </Link>
        <nav className="nav-links" aria-label="Public">
          <Link href="/events">Events</Link>
          <Link href="/dashboard">My registrations</Link>
          <Link href="/admin">Admin</Link>
          <Link href="/login">Sign in</Link>
        </nav>
      </div>
    </header>
  );
}
