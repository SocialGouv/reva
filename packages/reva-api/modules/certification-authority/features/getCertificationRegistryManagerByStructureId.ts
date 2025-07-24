import { CertificationRegistryManager } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";

export async function getCertificationRegistryManagerByStructureId(
  structureId: string,
): Promise<CertificationRegistryManager | null> {
  return prismaClient.certificationRegistryManager.findUnique({
    where: {
      certificationAuthorityStructureId: structureId,
    },
    include: {
      certificationAuthorityStructure: true,
      account: true,
    },
  });
}
