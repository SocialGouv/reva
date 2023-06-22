import { PrismaClient } from "@prisma/client";

export async function insertTrainingsIfNone(prisma: PrismaClient) {
  await prisma.training.upsert({
    where: {
      label: `Attestation de Formation aux Gestes et Soins d'Urgence (AFGSU)`,
    },
    update: {},
    create: {
      label: `Attestation de Formation aux Gestes et Soins d'Urgence (AFGSU)`,
    },
  });

  await prisma.training.upsert({
    where: {
      label: `Equipier de Première Intervention`,
    },
    update: {},
    create: {
      label: `Equipier de Première Intervention`,
    },
  });

  await prisma.training.upsert({
    where: {
      label: `Sauveteur Secouriste du Travail (SST)`,
    },
    update: {},
    create: {
      label: `Sauveteur Secouriste du Travail (SST)`,
    },
  });

  await prisma.training.upsert({
    where: {
      label: `Systèmes d'attaches`,
    },
    update: {},
    create: {
      label: `Systèmes d'attaches`,
    },
  });
}
