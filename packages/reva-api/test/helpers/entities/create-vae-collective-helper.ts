import { fakerFR as faker } from "@faker-js/faker";
import { Prisma } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

import { createAccountHelper } from "./create-account-helper";

export const createCohorteVaeCollectiveHelper = async (
  args?: Partial<Prisma.CohorteVaeCollectiveCreateInput>,
) => {
  const account = await createAccountHelper();

  return prismaClient.cohorteVaeCollective.create({
    data: {
      nom: faker.lorem.sentence(),
      codeInscription: faker.lorem.word(),

      commanditaireVaeCollective: {
        create: {
          raisonSociale: faker.lorem.sentence(),
          gestionnaire: {
            connect: {
              id: account.id,
            },
          },
        },
      },

      ...args,
    },
    include: {
      commanditaireVaeCollective: { include: { gestionnaire: true } },
      certificationCohorteVaeCollectives: {
        include: { certification: true },
      },
    },
  });
};
