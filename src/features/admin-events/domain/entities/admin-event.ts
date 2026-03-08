export type AdminEventStatus = 'scheduled' | 'draft';
export type PublicationStatus = 'published' | 'unpublished';

export interface AdminEvent {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly city: string;
  readonly venue: string;
  readonly startsAt: string;
  readonly capacity: number;
  readonly track: string;
  readonly summary: string;
  readonly status: AdminEventStatus;
  readonly publicationStatus: PublicationStatus;
  readonly createdAt: string;
}
