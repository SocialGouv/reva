import { faker } from "@faker-js/faker";
import { prismaClient } from "../../../prisma/client";
import { CertificationAuthority } from "@prisma/client";
import { createCertificationAuthorityStructureHelper } from "./create-certification-authority-structure-helper";

export const createCertificationAuthorityHelper = async (
  certificationAuthorityArgs?: Partial<CertificationAuthority>,
) => {
  const certificationAuthorityStructure =
    await createCertificationAuthorityStructureHelper();

  return prismaClient.certificationAuthority.create({
    data: {
      contactEmail: faker.internet.email(),
      contactFullName: faker.person.fullName(),
      label: faker.company.name(),
      certificationAuthorityStructureId: certificationAuthorityStructure.id,
      ...certificationAuthorityArgs,
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
      certificationAuthorityStructure: true,
      Account: true,
    },
  });
};
