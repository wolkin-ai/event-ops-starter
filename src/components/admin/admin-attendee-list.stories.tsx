import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
  AdminAttendeeList,
  type AdminAttendeeRow,
} from '@/components/admin/admin-attendee-list';

const sampleAttendees: readonly AdminAttendeeRow[] = [
  {
    id: 'reg_1',
    attendeeName: 'Aki Ito',
    attendeeEmail: 'aki@example.com',
    company: 'North Star Labs',
    seatCount: 2,
    status: 'confirmed',
    createdAt: '2026-03-01T10:00:00.000Z',
    eventTitle: 'Signal Summit Tokyo',
  },
  {
    id: 'reg_2',
    attendeeName: 'Mina Chen',
    attendeeEmail: 'mina@example.com',
    company: 'Field Notes',
    seatCount: 1,
    status: 'confirmed',
    createdAt: '2026-03-02T09:30:00.000Z',
    eventTitle: 'Ops Camp Osaka',
  },
];

const meta = {
  title: 'Admin/AdminAttendeeList',
  component: AdminAttendeeList,
  args: {
    attendees: sampleAttendees,
  },
} satisfies Meta<typeof AdminAttendeeList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    attendees: [],
  },
};
