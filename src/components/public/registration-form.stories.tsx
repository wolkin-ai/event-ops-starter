import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { RegistrationForm } from '@/components/public/registration-form';

const submit = fn(async () => ({ reference: 'CONF-2026' }));

const meta = {
  title: 'Public/RegistrationForm',
  component: RegistrationForm,
  args: {
    eventId: 'evt_signal_summit_tokyo',
    eventTitle: 'Signal Summit Tokyo',
    onSubmit: submit,
  },
} satisfies Meta<typeof RegistrationForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText('Full name'), 'Aki Ito');
    await userEvent.type(
      canvas.getByLabelText('Work email'),
      'aki@example.com',
    );
    await userEvent.type(canvas.getByLabelText('Company'), 'North Star Labs');
    await userEvent.click(canvas.getByRole('button', { name: 'Reserve seat' }));

    await expect(
      canvas.getByText(/Registration confirmed/),
    ).toBeInTheDocument();
  },
};
