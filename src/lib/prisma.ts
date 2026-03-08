import { PrismaLibSql } from '@prisma/adapter-libsql';

import { PrismaClient } from '@/generated/prisma/client';

declare global {
  var __eventOpsPrisma__: PrismaClient | undefined;
}

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? 'file:./dev.db',
});

export const prisma =
  globalThis.__eventOpsPrisma__ ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__eventOpsPrisma__ = prisma;
}
