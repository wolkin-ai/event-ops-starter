export type RegistrationStatus = 'confirmed';

export interface Registration {
  readonly id: string;
  readonly eventId: string;
  readonly attendeeName: string;
  readonly attendeeEmail: string;
  readonly company: string;
  readonly seatCount: number;
  readonly notes: string;
  readonly status: RegistrationStatus;
  readonly createdAt: string;
}
