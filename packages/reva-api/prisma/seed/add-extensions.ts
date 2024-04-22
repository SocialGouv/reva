import { PrismaClient } from "@prisma/client";

export async function addExtensions(prisma: PrismaClient) {
  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS cube`);
    await tx.$executeRawUnsafe(`CREATE EXTENSION  IF NOT EXISTS earthdistance`);
  });
}
