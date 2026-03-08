import { prisma } from '../src/lib/prisma';
import {
  buildSeedEventPlanRecords,
  buildSeedEventPublicationRecords,
} from '../src/lib/event-records';

async function main() {
  const planRecords = buildSeedEventPlanRecords();
  const publicationRecords = buildSeedEventPublicationRecords();

  for (const plan of planRecords) {
    await prisma.eventPlan.upsert({
      where: { id: plan.id },
      update: plan,
      create: plan,
    });
  }

  for (const publication of publicationRecords) {
    await prisma.eventPublication.upsert({
      where: { eventPlanId: publication.eventPlanId },
      update: publication,
      create: publication,
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
