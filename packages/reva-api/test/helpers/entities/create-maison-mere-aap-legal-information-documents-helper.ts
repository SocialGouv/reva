import { faker } from "@faker-js/faker";
import { Prisma } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

export const createMaisonMereAapLegalInformationDocumentsHelper = async ({
  maisonMereAAPId,
  ...overrides
}: {
  maisonMereAAPId: string;
} & Partial<Prisma.MaisonMereAAPLegalInformationDocumentsUncheckedCreateInput>) =>
  prismaClient.maisonMereAAPLegalInformationDocuments.create({
    data: {
      maisonMereAAPId,
      managerFirstname: faker.person.firstName(),
      managerLastname: faker.person.lastName(),
      delegataire: false,
      isTotalUpdate: false,
      ...overrides,
    },
  });
