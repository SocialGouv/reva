import { fakerFR as faker } from "@faker-js/faker";
import { ReorientationReason } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

export const createReorientationReasonHelper = async (
  reorientationReasonArgs?: Partial<ReorientationReason>,
) =>
  prismaClient.reorientationReason.create({
    data: {
      label: faker.lorem.sentence(),
      ...reorientationReasonArgs,
    },
  });
