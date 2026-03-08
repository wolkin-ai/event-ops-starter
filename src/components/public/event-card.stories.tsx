import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { EventCard } from '@/components/public/event-card';
import { publicEventSeeds } from '@/lib/seed-data';

const meta = {
  title: 'Public/EventCard',
  component: EventCard,
  args: {
    event: publicEventSeeds[0],
  },
} satisfies Meta<typeof EventCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
