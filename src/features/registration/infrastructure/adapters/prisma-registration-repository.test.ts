import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Registration } from '@/features/registration/domain/entities/registration';

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  findMany: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    eventPublication: {
      findUnique: mocks.findUnique,
      update: mocks.update,
    },
    registration: {
      create: mocks.create,
      findMany: mocks.findMany,
    },
    $transaction: mocks.transaction,
  },
}));

import { PrismaRegistrationRepository } from './prisma-registration-repository';

function buildRegistration(
  overrides: Partial<Registration> = {},
): Registration {
  return {
    id: 'registration-1',
    eventId: 'event-1',
    attendeeName: 'Aki Ito',
    attendeeEmail: 'aki@example.com',
    company: 'ORGO',
    seatCount: 2,
    notes: 'Vegetarian meal',
    status: 'confirmed',
    createdAt: '2026-03-12T10:00:00.000Z',
    ...overrides,
  };
}

describe('PrismaRegistrationRepository', () => {
  beforeEach(() => {
    mocks.findUnique.mockReset();
    mocks.findMany.mockReset();
    mocks.create.mockReset();
    mocks.update.mockReset();
    mocks.transaction.mockReset();
    mocks.transaction.mockResolvedValue([]);
    mocks.create.mockResolvedValue(undefined);
    mocks.update.mockResolvedValue(undefined);
  });

  it('persists a validated registration and decrements seats', async () => {
    mocks.findUnique.mockResolvedValue({
      seatsRemaining: 10,
      status: 'scheduled',
    });
    const repository = new PrismaRegistrationRepository();

    await expect(
      repository.save(
        buildRegistration({
          attendeeEmail: ' Aki@Example.com ',
        }),
      ),
    ).resolves.toBeUndefined();

    expect(mocks.findUnique).toHaveBeenCalledWith({
      where: { eventPlanId: 'event-1' },
      select: {
        seatsRemaining: true,
        status: true,
      },
    });
    expect(mocks.create).toHaveBeenCalledWith({
      data: {
        id: 'registration-1',
        eventPlanId: 'event-1',
        attendeeName: 'Aki Ito',
        attendeeEmail: 'aki@example.com',
        company: 'ORGO',
        seatCount: 2,
        notes: 'Vegetarian meal',
        status: 'confirmed',
        createdAt: new Date('2026-03-12T10:00:00.000Z'),
      },
    });
    expect(mocks.update).toHaveBeenCalledWith({
      where: { eventPlanId: 'event-1' },
      data: {
        seatsRemaining: {
          decrement: 2,
        },
      },
    });
    expect(mocks.transaction).toHaveBeenCalledTimes(1);
  });

  it('fails fast when the publication snapshot is invalid', async () => {
    mocks.findUnique.mockResolvedValue({
      seatsRemaining: -1,
      status: 'scheduled',
    });
    const repository = new PrismaRegistrationRepository();

    await expect(repository.save(buildRegistration())).rejects.toThrow(
      'Event publication availability is invalid for registration adapter.',
    );
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it('keeps the business error when the publication does not exist', async () => {
    mocks.findUnique.mockResolvedValue(null);
    const repository = new PrismaRegistrationRepository();

    await expect(repository.save(buildRegistration())).rejects.toThrow(
      'Event is not open for registration.',
    );
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it('fails fast when the registration payload is invalid', async () => {
    const repository = new PrismaRegistrationRepository();

    await expect(
      repository.save(
        buildRegistration({
          createdAt: 'not-a-date',
        }),
      ),
    ).rejects.toThrow();
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });

  it('maps validated registration records for list', async () => {
    mocks.findMany.mockResolvedValue([
      {
        id: 'registration-1',
        eventPlanId: 'event-1',
        attendeeName: 'Aki Ito',
        attendeeEmail: 'AKI@example.com',
        company: 'ORGO',
        seatCount: 2,
        notes: 'Vegetarian meal',
        status: 'confirmed',
        createdAt: new Date('2026-03-12T10:00:00.000Z'),
      },
    ]);
    const repository = new PrismaRegistrationRepository();

    await expect(
      repository.list({
        attendeeEmail: ' AKI@example.com ',
      }),
    ).resolves.toEqual([
      {
        id: 'registration-1',
        eventId: 'event-1',
        attendeeName: 'Aki Ito',
        attendeeEmail: 'aki@example.com',
        company: 'ORGO',
        seatCount: 2,
        notes: 'Vegetarian meal',
        status: 'confirmed',
        createdAt: '2026-03-12T10:00:00.000Z',
      },
    ]);
    expect(mocks.findMany).toHaveBeenCalledWith({
      where: {
        attendeeEmail: 'aki@example.com',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  });

  it('fails fast when list receives an invalid provider record', async () => {
    mocks.findMany.mockResolvedValue([
      {
        id: '',
        eventPlanId: 'event-1',
        attendeeName: 'Aki Ito',
        attendeeEmail: 'aki@example.com',
        company: 'ORGO',
        seatCount: 2,
        notes: 'Vegetarian meal',
        status: 'confirmed',
        createdAt: new Date('2026-03-12T10:00:00.000Z'),
      },
    ]);
    const repository = new PrismaRegistrationRepository();

    await expect(repository.list()).rejects.toThrow(
      'Registration record is invalid for registration adapter.',
    );
  });

  it('fails fast when list receives an invalid attendee email filter', async () => {
    const repository = new PrismaRegistrationRepository();

    await expect(
      repository.list({
        attendeeEmail: 'not-an-email',
      }),
    ).rejects.toThrow(
      'Registration attendeeEmail filter is invalid for registration adapter.',
    );
    expect(mocks.findMany).not.toHaveBeenCalled();
  });
});
