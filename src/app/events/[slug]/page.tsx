import { notFound } from 'next/navigation';

import { createCatalogServices } from '@/composition/catalog';
import { RegistrationPanel } from '@/components/public/registration-panel';
import { SiteHeader } from '@/components/public/site-header';

interface EventDetailPageProps {
  readonly params: Promise<{
    readonly slug: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { slug } = await params;
  const { getPublicEventBySlug } = createCatalogServices();
  const event = await getPublicEventBySlug.execute(slug);

  if (!event) {
    notFound();
  }

  return (
    <div className="public-page">
      <SiteHeader />
      <main className="container section-stack">
        <section className="section-block">
          <div className="section-heading">
            <p className="eyebrow">Public reference slice</p>
            <h1 className="section-title">{event.title}</h1>
            <p className="lead">{event.summary}</p>
          </div>
          <RegistrationPanel event={event} />
        </section>
        <section className="split-grid">
          <div className="panel">
            <p className="eyebrow">Operator notes</p>
            <ul className="note-list">
              {event.operatorNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
          <div className="panel">
            <p className="eyebrow">Why this route matters</p>
            <p className="body-copy">
              This page anchors the first end-to-end slice. Business
              stakeholders can review the narrative, while the implementation
              still routes through explicit domain rules.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
