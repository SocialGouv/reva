import { faker } from "@faker-js/faker";
import {
  Prisma,
  CertificationStatus,
  CertificationStatusV2,
  FeasibilityFormat,
} from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import { createCertificationAuthorityHelper } from "./create-certification-authority-helper";

export const createCertificationHelper = async (
  args?: Partial<Prisma.CertificationUncheckedCreateInput>,
) => {
  const certificationAuthority = await createCertificationAuthorityHelper();

  return prismaClient.certification.create({
    data: {
      label: faker.company.name(),
      level: 1,
      activities: faker.lorem.sentence(),
      activityArea: faker.lorem.sentence(),
      accessibleJobType: faker.lorem.word(),
      abilities: null,
      summary: faker.lorem.sentence(),
      status: CertificationStatus.AVAILABLE,
      statusV2: CertificationStatusV2.VALIDE_PAR_CERTIFICATEUR,
      availableAt: faker.date.past(),
      expiresAt: faker.date.future(),
      feasibilityFormat: FeasibilityFormat.UPLOADED_PDF,
      rncpLabel: faker.lorem.word(),
      rncpLevel: 1,
      rncpId: "37795",
      rncpTypeDiplome: "HyperDoctorat" as const,
      rncpExpiresAt: faker.date.future(),
      rncpDeliveryDeadline: faker.date.future(),
      certificationAuthorityStructureId:
        certificationAuthority
          .certificationAuthorityOnCertificationAuthorityStructure[0]
          .certificationAuthorityStructureId,
      ...args,
    },
    include: {
      certificationAuthorityStructure: {
        include: {
          certificationAuthorityOnCertificationAuthorityStructure: {
            include: { certificationAuthority: { include: { Account: true } } },
          },
          certificationRegistryManager: {
            include: {
              account: true,
            },
          },
        },
      },
    },
  });
};
