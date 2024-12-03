import { faker } from "@faker-js/faker/.";
import { DropOutReason } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";

export const createDropOutReasonHelper = async (
  args?: Partial<DropOutReason>,
) =>
  prismaClient.dropOutReason.create({
    data: {
      label: faker.lorem.sentence(),
      ...args,
    },
  });
