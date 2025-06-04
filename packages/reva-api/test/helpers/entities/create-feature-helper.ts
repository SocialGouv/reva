import { faker } from "@faker-js/faker/.";
import { prismaClient } from "../../../prisma/client";
import { Prisma } from "@prisma/client";

export const createFeatureHelper = async ({
  args,
}: {
  args?: Partial<Prisma.FeatureUncheckedCreateInput>;
}) =>
  prismaClient.feature.create({
    data: {
      isActive: true,
      key: faker.string.uuid(),
      label: faker.lorem.word(),
      ...args,
    },
  });
