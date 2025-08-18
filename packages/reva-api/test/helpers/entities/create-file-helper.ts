import { faker } from "@faker-js/faker";

import { prismaClient } from "@/prisma/client";

export const createFileHelper = async (fileArgs?: Partial<File>) =>
  prismaClient.file.create({
    data: {
      id: faker.string.uuid(),
      name: faker.lorem.word(),
      mimeType: "application/pdf",
      path: faker.lorem.word(),
      ...fileArgs,
    },
  });
