import type { AdminEventRepository } from '@/features/admin-events/application/ports/admin-event-repository';
import type { AdminEventPublication } from '@/features/admin-events/domain/entities/admin-event-publication';

export interface UpdateAdminEventPublicationInput {
  readonly eventId: string;
  readonly title: string;
  readonly summary: string;
  readonly heroEyebrow: string;
  readonly heroBlurb: string;
  readonly audience: string;
  readonly trackLabel: string;
  readonly highlights: readonly string[];
  readonly operatorNotes: readonly string[];
}

function normalizeLines(items: readonly string[]) {
  return items
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(0, 5);
}

export class UpdateAdminEventPublicationUseCase {
  constructor(private readonly repository: AdminEventRepository) {}

  async execute(
    input: UpdateAdminEventPublicationInput,
  ): Promise<AdminEventPublication> {
    const eventId = input.eventId.trim();
    const title = input.title.trim();
    const summary = input.summary.trim();
    const heroEyebrow = input.heroEyebrow.trim();
    const heroBlurb = input.heroBlurb.trim();
    const audience = input.audience.trim();
    const trackLabel = input.trackLabel.trim();
    const highlights = normalizeLines(input.highlights);
    const operatorNotes = normalizeLines(input.operatorNotes);

    if (!eventId) {
      throw new Error('EventId is required.');
    }

    if (title.length < 4) {
      throw new Error('Publication title must contain at least 4 characters.');
    }

    if (summary.length < 8) {
      throw new Error(
        'Publication summary must contain at least 8 characters.',
      );
    }

    if (heroEyebrow.length < 4) {
      throw new Error(
        'Publication eyebrow must contain at least 4 characters.',
      );
    }

    if (heroBlurb.length < 8) {
      throw new Error(
        'Publication hero blurb must contain at least 8 characters.',
      );
    }

    if (audience.length < 4) {
      throw new Error('Audience must contain at least 4 characters.');
    }

    if (trackLabel.length < 2) {
      throw new Error('Track label must contain at least 2 characters.');
    }

    if (highlights.length === 0) {
      throw new Error('At least one highlight is required.');
    }

    if (operatorNotes.length === 0) {
      throw new Error('At least one operator note is required.');
    }

    const currentPublication = await this.repository.getPublication(eventId);

    if (!currentPublication) {
      throw new Error(
        'Event publication must exist before public copy can be edited.',
      );
    }

    return this.repository.updatePublication({
      ...currentPublication,
      title,
      summary,
      heroEyebrow,
      heroBlurb,
      audience,
      trackLabel,
      highlights,
      operatorNotes,
    });
  }
}
