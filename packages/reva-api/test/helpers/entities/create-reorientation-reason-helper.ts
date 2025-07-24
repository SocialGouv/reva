import { faker } from "@faker-js/faker/locale/fr";
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
