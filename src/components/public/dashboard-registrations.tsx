import { formatEventDate } from '@/lib/format-date';

export interface DashboardRegistrationCard {
  readonly id: string;
  readonly attendeeName: string;
  readonly company: string;
  readonly seatCount: number;
  readonly status: string;
  readonly eventTitle: string;
  readonly startsAt: string | null;
}

interface DashboardRegistrationsProps {
  readonly registrations: readonly DashboardRegistrationCard[];
}

export function DashboardRegistrations({
  registrations,
}: DashboardRegistrationsProps) {
  if (registrations.length === 0) {
    return (
      <section className="empty-state">
        <p className="eyebrow">Nothing booked yet</p>
        <h2 className="section-title">
          Run the public registration slice first.
        </h2>
        <p className="body-copy">
          The dashboard is session-aware now. Sign in as an attendee or finish a
          registration to populate this view from Prisma-backed data.
        </p>
      </section>
    );
  }

  return (
    <section className="dashboard-grid">
      {registrations.map((registration) => {
        const companyName =
          registration.company.trim() === ''
            ? 'Independent'
            : registration.company;

        return (
          <article className="panel" key={registration.id}>
            <div className="badge-row">
              <span className="badge">{registration.status}</span>
              <span className="badge">{registration.seatCount} seats</span>
            </div>
            <div className="stack-sm">
              <h2 className="section-title">{registration.eventTitle}</h2>
              <p className="body-copy">
                Registered as {registration.attendeeName} for {companyName}.
              </p>
              {registration.startsAt !== null ? (
                <p className="body-copy">
                  {formatEventDate(registration.startsAt)}
                </p>
              ) : null}
            </div>
          </article>
        );
      })}
    </section>
  );
}
