import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { AdminPublicationForm } from '@/components/admin/admin-publication-form';

const submit = fn(async () => undefined);

const meta = {
  title: 'Admin/AdminPublicationForm',
  component: AdminPublicationForm,
  args: {
    publication: {
      eventId: 'evt_signal_summit_tokyo',
      slug: 'signal-summit-tokyo',
      publicationStatus: 'published',
      title: 'Signal Summit Tokyo',
      summary: 'A flagship operations event for live experience teams.',
      heroEyebrow: 'Flagship / live publication',
      heroBlurb: 'Refine the public narrative without touching the EventPlan.',
      audience: 'Operators, producers, field marketers',
      trackLabel: 'Summit',
      highlights: ['Campaign room design workshop', 'Live ops tabletop'],
      operatorNotes: ['Keep public promises aligned with ownership.'],
      seatsTotal: 240,
      seatsRemaining: 31,
      city: 'Tokyo',
      venue: 'Harbor Stage',
      startsAt: '2026-05-12T09:30:00+09:00',
    },
    onSubmit: submit,
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
} satisfies Meta<typeof AdminPublicationForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.clear(canvas.getByLabelText('Public title'));
    await userEvent.type(
      canvas.getByLabelText('Public title'),
      'Signal Summit Tokyo Live',
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Save public copy' }),
    );

    await expect(canvas.getByText('Public copy updated.')).toBeInTheDocument();
  },
};
