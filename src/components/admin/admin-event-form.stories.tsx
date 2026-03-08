import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { AdminEventForm } from '@/components/admin/admin-event-form';

const submit = fn(async () => ({ reference: 'EVT-2026' }));

const meta = {
  title: 'Admin/AdminEventForm',
  component: AdminEventForm,
  args: {
    onSubmit: submit,
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
} satisfies Meta<typeof AdminEventForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText('Title'), 'Control Room Clinic');
    await userEvent.type(canvas.getByLabelText('Venue'), 'Studio North');
    await userEvent.type(
      canvas.getByLabelText('Summary'),
      'Hands-on clinic for ops runbooks.',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Create event' }));

    await expect(canvas.getByText(/Event drafted/)).toBeInTheDocument();
  },
};
