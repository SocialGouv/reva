import { randomUUID } from "crypto";

import { faker } from "@faker-js/faker";
import { CandidacyConventionCollective } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

export const createCandidacyCCNHelper = async (
  args?: Partial<CandidacyConventionCollective>,
) => {
  return prismaClient.candidacyConventionCollective.create({
    data: {
      id: randomUUID(),
      idcc: faker.string.alphanumeric(10),
      label: faker.lorem.word(),
      ...args,
    },
  });
};
