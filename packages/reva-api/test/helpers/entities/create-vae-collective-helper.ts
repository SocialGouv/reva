import { faker } from "@faker-js/faker/locale/fr";
import { prismaClient } from "../../../prisma/client";
import { Prisma } from "@prisma/client";

export const createCohorteVaeCollectiveHelper = async (
  args?: Partial<Prisma.CohorteVaeCollectiveCreateInput>,
) => {
  return prismaClient.cohorteVaeCollective.create({
    data: {
      nom: faker.lorem.sentence(),
      codeInscription: faker.lorem.word(),
      projetVaeCollective: {
        create: {
          nom: faker.lorem.sentence(),
          commanditaireVaeCollective: {
            create: {
              raisonSociale: faker.lorem.sentence(),
            },
          },
        },
      },
      ...args,
    },
    include: {
      projetVaeCollective: { include: { commanditaireVaeCollective: true } },
      certificationCohorteVaeCollectives: {
        include: { certification: true },
      },
    },
  });
};
