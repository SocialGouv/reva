import { faker } from "@faker-js/faker";
import { prismaClient } from "../../../prisma/client";
import { Prisma } from "@prisma/client";
import { createCertificationAuthorityStructureHelper } from "./create-certification-authority-structure-helper";

export const createCertificationAuthorityHelper = async (
  args?: Partial<Prisma.CertificationAuthorityCreateInput>,
) => {
  const certificationAuthorityStructure =
    await createCertificationAuthorityStructureHelper();

  return prismaClient.certificationAuthority.create({
    data: {
      contactEmail: faker.internet.email(),
      contactFullName: faker.person.fullName(),
      label: faker.company.name(),
      certificationAuthorityOnCertificationAuthorityStructure: {
        create: {
          certificationAuthorityStructureId: certificationAuthorityStructure.id,
        },
      },
      ...args,
      Account: {
        create: {
          email: faker.internet.email(),
          firstname: faker.person.firstName(),
          lastname: faker.person.lastName(),
          keycloakId: faker.string.uuid(),
        },
      },
    },
    include: {
      certificationAuthorityOnCertificationAuthorityStructure: {
        include: { certificationAuthorityStructure: true },
      },
      Account: true,
    },
  });
};
