import Link from 'next/link';

import type { AdminEvent } from '@/features/admin-events/domain/entities/admin-event';
import { formatEventDate } from '@/lib/format-date';

interface AdminEventListProps {
  readonly events: readonly AdminEvent[];
  readonly pendingEventId?: string | null;
  readonly onPublish?: (eventId: string) => void;
  readonly onUnpublish?: (eventId: string) => void;
}

export function AdminEventList({
  events,
  pendingEventId = null,
  onPublish,
  onUnpublish,
}: AdminEventListProps) {
  if (events.length === 0) {
    return (
      <section className="empty-state">
        <p className="eyebrow">No events yet</p>
        <h2 className="section-title">Create the first operational plan.</h2>
      </section>
    );
  }

  return (
    <section className="table-shell">
      <div className="table-header">
        <div className="stack-sm">
          <p className="table-caption">Active events</p>
          <h2 className="section-title">
            Operator-facing list with recent additions first.
          </h2>
        </div>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Event</th>
            <th>Starts</th>
            <th>Venue</th>
            <th>Track</th>
            <th>Plan</th>
            <th>Public</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id}>
              <td>
                <div className="stack-sm">
                  <strong>{event.title}</strong>
                  <span className="status-copy">{event.city}</span>
                </div>
              </td>
              <td>{formatEventDate(event.startsAt)}</td>
              <td>{event.venue}</td>
              <td>{event.track}</td>
              <td>
                <span className="status-pill">{event.status}</span>
              </td>
              <td>
                <span
                  className={`status-pill ${
                    event.publicationStatus === 'published'
                      ? ''
                      : 'status-pill-muted'
                  }`}
                >
                  {event.publicationStatus}
                </span>
              </td>
              <td>
                {event.publicationStatus === 'published' ? (
                  <div className="button-row">
                    <Link
                      href={`/admin/events/${event.id}/publication`}
                      className="button button-ghost button-compact"
                    >
                      Edit copy
                    </Link>
                    <button
                      type="button"
                      className="button button-ghost button-compact"
                      onClick={() => onUnpublish?.(event.id)}
                      disabled={pendingEventId === event.id || !onUnpublish}
                    >
                      {pendingEventId === event.id ? 'Updating…' : 'Withdraw'}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="button button-ghost button-compact"
                    onClick={() => onPublish?.(event.id)}
                    disabled={pendingEventId === event.id || !onPublish}
                  >
                    {pendingEventId === event.id ? 'Updating…' : 'Publish'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
