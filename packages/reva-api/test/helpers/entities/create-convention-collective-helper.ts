import { faker } from "@faker-js/faker";
import { ConventionCollective } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

export const createCCNHelper = async (
  ccnArgs?: Partial<ConventionCollective>,
) =>
  prismaClient.conventionCollective.create({
    data: {
      code: faker.string.numeric(5),
      label: faker.company.name(),
      ...ccnArgs,
    },
  });
