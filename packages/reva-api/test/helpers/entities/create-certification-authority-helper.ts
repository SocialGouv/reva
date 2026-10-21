import { faker } from "@faker-js/faker";
import { Prisma } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

import { createCertificationAuthorityStructureHelper } from "./create-certification-authority-structure-helper";

export const createCertificationAuthorityHelper = async (
  args?: Partial<Prisma.CertificationAuthorityCreateInput>,
) => {
  const certificationAuthorityStructure =
    await createCertificationAuthorityStructureHelper();

  const certificationAuthority =
    await prismaClient.certificationAuthority.create({
      data: {
        contactEmail: faker.internet.email(),
        contactFullName: faker.person.fullName(),
        label: faker.company.name(),
        certificationAuthorityOnCertificationAuthorityStructure: {
          create: {
            certificationAuthorityStructureId:
              certificationAuthorityStructure.id,
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

  // Mirrors createAccount's dual-write: the account is also linked through
  // the certification_authority_on_account table, which is now the source of
  // truth read by authorization checks (e.g. canManageJury).
  await prismaClient.certificationAuthorityOnAccount.create({
    data: {
      certificationAuthorityId: certificationAuthority.id,
      accountId: certificationAuthority.Account[0].id,
    },
  });

  return certificationAuthority;
};
