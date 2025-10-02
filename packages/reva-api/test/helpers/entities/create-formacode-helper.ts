import { faker } from "@faker-js/faker";

import { prismaClient } from "@/prisma/client";

export const createFormaCodeHelper = async () => {
  return prismaClient.formacode.create({
    data: {
      code: faker.string.alpha(30),
      label: faker.lorem.word(),
      type: "SUB_DOMAIN",
      version: "v14",
    },
  });
};
