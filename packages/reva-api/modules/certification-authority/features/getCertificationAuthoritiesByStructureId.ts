import { prismaClient } from "../../../prisma/client";
import { CertificationAuthority } from "../certification-authority.types";

export async function getCertificationAuthoritiesByStructureId(
  structureId: string
): Promise<CertificationAuthority[] | null> {
  return prismaClient.certificationAuthorityStructure
    .findUnique({
      where: {
        id: structureId
      },
    })
    .certificationAuthorities();
}
