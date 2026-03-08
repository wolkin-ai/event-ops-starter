import Link from 'next/link';

import type { PublicEvent } from '@/features/catalog/domain/entities/public-event';
import { formatEventDate } from '@/lib/format-date';

interface EventCardProps {
  readonly event: PublicEvent;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <article className="event-card">
      <div className="badge-row">
        <span className="badge">{event.trackLabel}</span>
        <span className="badge">{event.city}</span>
      </div>
      <div className="stack-sm">
        <h3>{event.title}</h3>
        <p className="body-copy">{event.summary}</p>
      </div>
      <div className="meta-row">
        <span className="badge">
          {formatEventDate(event.schedule.startsAt)}
        </span>
        <span className="badge">{event.seatsRemaining} seats left</span>
      </div>
      <Link href={`/events/${event.slug}`} className="button">
        View event
      </Link>
    </article>
  );
}
