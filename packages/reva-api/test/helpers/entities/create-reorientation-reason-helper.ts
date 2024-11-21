import { faker } from "@faker-js/faker/locale/fr";
import { prismaClient } from "../../../prisma/client";

export const createReorientationReasonHelper = async () =>
  prismaClient.reorientationReason.create({
    data: {
      label: faker.lorem.sentence(),
    },
  });
