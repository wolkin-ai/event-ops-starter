import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { EventPublication } from '@/generated/prisma/client';

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  findFirst: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    eventPublication: {
      findMany: mocks.findMany,
      findFirst: mocks.findFirst,
    },
  },
}));

import { PrismaEventCatalogRepository } from './prisma-event-catalog-repository';

function buildEventPublication(
  overrides: Partial<EventPublication> = {},
): EventPublication {
  return {
    eventPlanId: 'event-1',
    slug: 'operator-summit',
    title: 'Operator Summit',
    summary: 'Runbooks for community operators.',
    city: 'Tokyo',
    venue: 'Station Hall',
    heroEyebrow: 'Ops / live',
    heroBlurb: 'A public projection for operator teams.',
    audience: 'Operators',
    trackLabel: 'Operations',
    seatsTotal: 120,
    seatsRemaining: 64,
    status: 'scheduled',
    highlights: JSON.stringify(['Playbooks', 'Checklists']),
    operatorNotes: JSON.stringify(['Doors open at 09:00']),
    startsAt: new Date('2026-06-10T01:00:00.000Z'),
    endsAt: new Date('2026-06-10T05:00:00.000Z'),
    timezone: 'Asia/Tokyo',
    createdAt: new Date('2026-03-01T00:00:00.000Z'),
    updatedAt: new Date('2026-03-01T00:00:00.000Z'),
    ...overrides,
  };
}

describe('PrismaEventCatalogRepository', () => {
  beforeEach(() => {
    mocks.findMany.mockReset();
    mocks.findFirst.mockReset();
  });

  it('maps validated publication records for listAll', async () => {
    mocks.findMany.mockResolvedValue([buildEventPublication()]);
    const repository = new PrismaEventCatalogRepository();

    await expect(repository.listAll()).resolves.toEqual([
      expect.objectContaining({
        id: 'event-1',
        slug: 'operator-summit',
        status: 'scheduled',
      }),
    ]);
    expect(mocks.findMany).toHaveBeenCalledWith({
      where: {
        status: {
          not: 'draft',
        },
      },
      orderBy: {
        startsAt: 'asc',
      },
    });
  });

  it('fails fast when Prisma returns an invalid publication record', async () => {
    mocks.findMany.mockResolvedValue([
      {
        ...buildEventPublication(),
        startsAt: '2026-06-10T01:00:00.000Z',
      },
    ]);
    const repository = new PrismaEventCatalogRepository();

    await expect(repository.listAll()).rejects.toThrow(
      'Event publication record is invalid for catalog adapter.',
    );
  });

  it('returns null when the slug lookup misses', async () => {
    mocks.findFirst.mockResolvedValue(null);
    const repository = new PrismaEventCatalogRepository();

    await expect(repository.getBySlug(' missing ')).resolves.toBeNull();
    expect(mocks.findFirst).toHaveBeenCalledWith({
      where: {
        slug: 'missing',
        status: {
          not: 'draft',
        },
      },
    });
  });

  it('fails fast when getBySlug receives a blank slug', async () => {
    const repository = new PrismaEventCatalogRepository();

    await expect(repository.getBySlug('   ')).rejects.toThrow(
      'Event slug is invalid for catalog adapter.',
    );
    expect(mocks.findFirst).not.toHaveBeenCalled();
  });

  it('fails fast when getBySlug receives an invalid provider record', async () => {
    mocks.findFirst.mockResolvedValue(
      buildEventPublication({
        eventPlanId: '',
      }),
    );
    const repository = new PrismaEventCatalogRepository();

    await expect(repository.getBySlug('operator-summit')).rejects.toThrow(
      'Event publication record is invalid for catalog adapter.',
    );
  });
});
