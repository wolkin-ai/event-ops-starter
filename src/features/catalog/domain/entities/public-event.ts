export type PublicEventStatus = 'scheduled' | 'sold_out' | 'draft';

export interface PublicEventSchedule {
  readonly startsAt: string;
  readonly endsAt: string;
  readonly timezone: string;
}

export interface PublicEvent {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly city: string;
  readonly venue: string;
  readonly heroEyebrow: string;
  readonly heroBlurb: string;
  readonly audience: string;
  readonly trackLabel: string;
  readonly seatsTotal: number;
  readonly seatsRemaining: number;
  readonly status: PublicEventStatus;
  readonly schedule: PublicEventSchedule;
  readonly highlights: readonly string[];
  readonly operatorNotes: readonly string[];
}
