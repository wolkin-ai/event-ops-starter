import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { AdminEventList } from '@/components/admin/admin-event-list';
import { adminEventSeeds } from '@/lib/seed-data';

const meta = {
  title: 'Admin/AdminEventList',
  component: AdminEventList,
  args: {
    events: adminEventSeeds,
    onPublish: fn(),
    onUnpublish: fn(),
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
} satisfies Meta<typeof AdminEventList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MixedPublicationStates: Story = {
  args: {
    events: [
      ...adminEventSeeds,
      {
        id: 'adm_control_room_clinic',
        title: 'Control Room Clinic',
        slug: 'control-room-clinic',
        city: 'Tokyo',
        venue: 'Studio North',
        startsAt: '2026-09-03T10:00:00+09:00',
        capacity: 120,
        track: 'Clinic',
        summary: 'Hands-on clinic for ops runbooks.',
        status: 'draft',
        publicationStatus: 'unpublished',
        createdAt: '2026-04-03T09:00:00+09:00',
      },
    ],
  },
};
