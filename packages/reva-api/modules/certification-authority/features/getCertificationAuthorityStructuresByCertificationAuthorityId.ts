import { prismaClient } from "@/prisma/client";

export const getCertificationAuthorityStructuresByCertificationAuthorityId =
  async ({ certificationAuthorityId }: { certificationAuthorityId: string }) =>
    prismaClient.certificationAuthority
      .findUnique({
        where: { id: certificationAuthorityId },
      })
      .certificationAuthorityOnCertificationAuthorityStructure({
        include: { certificationAuthorityStructure: true },
        orderBy: { certificationAuthorityStructure: { label: "asc" } },
      })
      .then(
        (caocass) =>
          caocass?.map((caocas) => caocas.certificationAuthorityStructure) ||
          [],
      );
