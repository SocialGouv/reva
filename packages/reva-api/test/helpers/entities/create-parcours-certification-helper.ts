import { faker } from "@faker-js/faker";
import { Prisma } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

import { createCertificationHelper } from "./create-certification-helper";

export const createParcoursCertificationHelper = async (
  parcoursCertificationArgs?: Partial<Prisma.ParcoursCertificationUncheckedCreateInput>,
) => {
  let certificationId;
  if (parcoursCertificationArgs?.certificationId) {
    certificationId = parcoursCertificationArgs.certificationId;
  } else {
    certificationId = (await createCertificationHelper()).id;
  }
  return prismaClient.parcoursCertification.create({
    data: {
      label: faker.lorem.sentence(),
      uai: faker.string.uuid(),
      nomEtablissement: faker.lorem.sentence(),
      certificationId,
      ...parcoursCertificationArgs,
    },
  });
};
