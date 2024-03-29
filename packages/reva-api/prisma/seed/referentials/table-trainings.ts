import { PrismaClient } from "@prisma/client";

export async function upsertTrainings(prisma: PrismaClient) {
  await prisma.training.upsert({
    // This label was modified by migration 20230629172500_rename_traning_AFGSU
    where: {
      label: `Attestation de Formation aux Gestes et Soins d'Urgence (AFGSU 2)`,
    },
    update: {},
    create: {
      label: `Attestation de Formation aux Gestes et Soins d'Urgence (AFGSU 2)`,
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

  await prisma.training.upsert({
    where: {
      label: `Prévention et secours civiques de niveau 1 (PSC1)`,
    },
    update: {},
    create: {
      label: `Prévention et secours civiques de niveau 1 (PSC1)`,
    },
  });

  await prisma.training.upsert({
    where: {
      label: `Premiers secours en équipe de niveau 1 (PSE1)`,
    },
    update: {},
    create: {
      label: `Premiers secours en équipe de niveau 1 (PSE1)`,
    },
  });

  await prisma.training.upsert({
    where: {
      label: `Brevet national de sécurité et de sauvetage aquatique (BNSSA)`,
    },
    update: {},
    create: {
      label: `Brevet national de sécurité et de sauvetage aquatique (BNSSA)`,
    },
  });
}
