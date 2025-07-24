import { faker } from "@faker-js/faker/locale/fr";
import { Prisma } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

export const createCohorteVaeCollectiveHelper = async (
  args?: Partial<Prisma.CohorteVaeCollectiveCreateInput>,
) => {
  return prismaClient.cohorteVaeCollective.create({
    data: {
      nom: faker.lorem.sentence(),
      codeInscription: faker.lorem.word(),

      commanditaireVaeCollective: {
        create: {
          raisonSociale: faker.lorem.sentence(),
        },
      },

      ...args,
    },
    include: {
      commanditaireVaeCollective: true,
      certificationCohorteVaeCollectives: {
        include: { certification: true },
      },
    },
  });
};
