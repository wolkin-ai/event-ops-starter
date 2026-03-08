import type { PublicationStatus } from './admin-event';

export interface AdminEventPublication {
  readonly eventId: string;
  readonly slug: string;
  readonly publicationStatus: PublicationStatus;
  readonly title: string;
  readonly summary: string;
  readonly heroEyebrow: string;
  readonly heroBlurb: string;
  readonly audience: string;
  readonly trackLabel: string;
  readonly highlights: readonly string[];
  readonly operatorNotes: readonly string[];
  readonly seatsTotal: number;
  readonly seatsRemaining: number;
  readonly city: string;
  readonly venue: string;
  readonly startsAt: string;
}
