import { prismaClient } from "@/prisma/client";

export const getCertificationsByCertificationStructureId = ({
  certificationStructureId,
}: {
  certificationStructureId: string;
}) =>
  prismaClient.certificationAuthorityStructure
    .findUnique({
      where: { id: certificationStructureId },
    })
    .certifications();
