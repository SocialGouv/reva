import { faker } from "@faker-js/faker/.";
import { CertificationAuthorityStructure } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";

export const createCertificationAuthorityStructureHelper = async (
  args?: Partial<CertificationAuthorityStructure>,
) =>
  prismaClient.certificationAuthorityStructure.create({
    data: {
      label: faker.lorem.sentence(),
      ...args,
    },
  });
