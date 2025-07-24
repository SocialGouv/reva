import { faker } from "@faker-js/faker/.";
import { Prisma } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

import { createAccountHelper } from "./create-account-helper";

export const createCertificationAuthorityStructureHelper = async (
  args?: Partial<Prisma.CertificationAuthorityStructureCreateInput>,
) => {
  const registryManagerAccount = await createAccountHelper();

  return prismaClient.certificationAuthorityStructure.create({
    data: {
      label: faker.lorem.sentence(),
      certificationRegistryManager: {
        create: { accountId: registryManagerAccount.id },
      },
      ...args,
    },
    include: { certificationRegistryManager: { include: { account: true } } },
  });
};
