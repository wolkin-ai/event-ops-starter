import { formatEventDate } from '@/lib/format-date';

export interface AdminAttendeeRow {
  readonly id: string;
  readonly attendeeName: string;
  readonly attendeeEmail: string;
  readonly company: string;
  readonly seatCount: number;
  readonly status: string;
  readonly createdAt: string;
  readonly eventTitle: string;
}

interface AdminAttendeeListProps {
  readonly attendees: readonly AdminAttendeeRow[];
}

export function AdminAttendeeList({ attendees }: AdminAttendeeListProps) {
  if (attendees.length === 0) {
    return (
      <section className="empty-state">
        <p className="eyebrow">No attendees yet</p>
        <h2 className="section-title">Registrations will appear here.</h2>
      </section>
    );
  }

  return (
    <section className="table-shell">
      <div className="table-header">
        <div className="stack-sm">
          <p className="table-caption">Attendee operations</p>
          <h2 className="section-title">
            Review confirmed seats without leaving the admin console.
          </h2>
        </div>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Attendee</th>
            <th>Event</th>
            <th>Seats</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {attendees.map((attendee) => (
            <tr key={attendee.id}>
              <td>
                <div className="stack-sm">
                  <strong>{attendee.attendeeName}</strong>
                  <span className="status-copy">{attendee.attendeeEmail}</span>
                </div>
              </td>
              <td>
                <div className="stack-sm">
                  <strong>{attendee.eventTitle}</strong>
                  <span className="status-copy">
                    {attendee.company || 'Independent'}
                  </span>
                </div>
              </td>
              <td>{attendee.seatCount}</td>
              <td>
                <span className="status-pill">{attendee.status}</span>
              </td>
              <td>{formatEventDate(attendee.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
