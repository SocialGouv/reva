import { PrismaClient } from "@prisma/client";

export const upsertGoals = async (prisma: PrismaClient) => {
  await prisma.goal.upsert({
    where: {
      label: "Trouver plus facilement un emploi",
    },
    update: {},
    create: {
      label: "Trouver plus facilement un emploi",
      order: 1,
      isActive: true,
    },
  });
  await prisma.goal.upsert({
    where: {
      label: "Être reconnu dans ma profession",
    },
    update: {},
    create: {
      label: "Être reconnu dans ma profession",
      order: 2,
      isActive: true,
    },
  });
  await prisma.goal.upsert({
    where: {
      label: "Avoir un meilleur salaire",
    },
    update: {},
    create: {
      label: "Avoir un meilleur salaire",
      order: 3,
      isActive: true,
    },
  });
  await prisma.goal.upsert({
    where: {
      label: "Me réorienter",
    },
    update: {},
    create: {
      label: "Me réorienter",
      order: 4,
      isActive: true,
    },
  });
  await prisma.goal.upsert({
    where: {
      label: "Consolider mes acquis métier",
    },
    update: {},
    create: {
      label: "Consolider mes acquis métier",
      order: 5,
      isActive: true,
    },
  });
  await prisma.goal.upsert({
    where: {
      label: "Me redonner confiance en moi",
    },
    update: {},
    create: {
      label: "Me redonner confiance en moi",
      order: 6,
      isActive: true,
    },
  });
  await prisma.goal.upsert({
    where: {
      label: "Autre",
    },
    update: {},
    create: {
      label: "Autre",
      order: 7,
      isActive: true,
    },
  });
};
