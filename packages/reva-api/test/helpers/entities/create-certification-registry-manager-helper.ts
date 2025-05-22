import { faker } from "@faker-js/faker";
import { prismaClient } from "../../../prisma/client";
import { createAccountHelper } from "./create-account-helper";
import { createCertificationHelper } from "./create-certification-helper";

export const createCertificationRegistryManagerHelper = async ({
  certificationId,
}: {
  certificationId?: string;
} = {}) => {
  const account = await createAccountHelper();
  const certification = certificationId
    ? await prismaClient.certification.findUnique({
        where: { id: certificationId },
      })
    : await createCertificationHelper();

  if (!certification) {
    throw new Error(`La certification ${certificationId} n'existe pas`);
  }

  const structure = await prismaClient.certificationAuthorityStructure.create({
    data: {
      label: faker.company.name(),
    },
  });

  // Associate the certification with the structure
  await prismaClient.certification.update({
    where: { id: certification.id },
    data: { certificationAuthorityStructureId: structure.id },
  });

  // Create the certification registry manager
  const registryManager =
    await prismaClient.certificationRegistryManager.create({
      data: {
        accountId: account.id,
        certificationAuthorityStructureId: structure.id,
      },
      include: {
        account: true,
        certificationAuthorityStructure: true,
      },
    });

  return {
    registryManager,
    account,
    certification,
    structure,
  };
};
