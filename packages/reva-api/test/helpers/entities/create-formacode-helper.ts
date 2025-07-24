import { faker } from "@faker-js/faker";
import { Prisma } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";

export const createFormaCodeHelper = async (
  formaCodeArgs?: Partial<Prisma.FormacodeCreateInput>,
) => {
  prismaClient.formacode.create({
    data: {
      code: faker.string.alpha(30),
      label: faker.lorem.word(),
      type: "DOMAIN",
    },
  });

  return prismaClient.formacode.create({
    data: {
      code: faker.string.alpha(30),
      label: faker.lorem.word(),
      type: "SUB_DOMAIN",
      ...formaCodeArgs,
    },
  });
};
