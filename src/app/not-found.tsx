import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="public-page">
      <main className="container section-stack">
        <section className="empty-state">
          <p className="eyebrow">Not found</p>
          <h1 className="section-title">
            This route is not part of the starter slice.
          </h1>
          <div className="button-row">
            <Link href="/" className="button">
              Back to home
            </Link>
            <Link href="/events" className="button button-secondary">
              Browse events
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
