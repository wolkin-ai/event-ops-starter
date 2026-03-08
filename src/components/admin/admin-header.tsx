import Link from 'next/link';

export function AdminHeader() {
  return (
    <header className="admin-header">
      <div className="header-inner">
        <Link href="/admin" className="brand-lockup">
          <span className="brand-mark">AO</span>
          <span className="brand-copy">
            <strong>Admin Operations</strong>
            <span>Planner, checklists, and control-room overview</span>
          </span>
        </Link>
        <nav className="nav-links" aria-label="Admin">
          <Link href="/">Public site</Link>
          <Link href="/admin/events">Events</Link>
          <Link href="/admin/attendees">Attendees</Link>
          <Link href="/admin/events/new">Create</Link>
          <Link href="/login">Switch role</Link>
        </nav>
      </div>
    </header>
  );
}
