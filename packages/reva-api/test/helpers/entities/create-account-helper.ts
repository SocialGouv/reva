import { faker } from "@faker-js/faker";
import { Account } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";

export const createAccountHelper = async (accountArgs?: Partial<Account>) =>
  prismaClient.account.create({
    data: {
      email: faker.internet.email(),
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      keycloakId: faker.string.uuid(),
      ...accountArgs,
    },
  });
