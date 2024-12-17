import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seeds/users.seed';

export const MONGO_SEEDS = [seedUsers];

const prisma = new PrismaClient();

async function main() {
  await seedMongo();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

async function runSeed(fn: (prisma: PrismaClient) => Promise<void>) {
  await fn(prisma);
  await prisma.seed.create({
    data: {
      seed: fn.name,
    },
  });
  console.log(`${fn.name} finished.`);
}

async function seedMongo() {
  console.log('Start seeding ...');

  const dbSeeds = await prisma.seed.findMany();
  const seedsMap = dbSeeds.reduce(
    (acc, seed) => {
      acc[seed.seed] = seed;
      return acc;
    },
    {} as Record<string, any>,
  );
  const pendingSeeds = MONGO_SEEDS.filter((seed) => {
    const pending = !seedsMap[seed.name];
    if (!pending) {
      console.log(`Skipping ${seed.name}`);
    }
    return pending;
  });

  for (const seed of pendingSeeds) {
    await runSeed(seed);
    console.log(`Seeding ${seed.name} finished.`);
  }

  console.log(pendingSeeds);

  console.log(`Seeding finished.`);
}
