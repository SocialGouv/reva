import { prismaClient } from "@/prisma/client";

export const getCertificationAuthorityStructureById = ({
  certificationAuthorityStructureId,
}: {
  certificationAuthorityStructureId: string;
}) =>
  prismaClient.certificationAuthorityStructure.findUnique({
    where: {
      id: certificationAuthorityStructureId,
    },
  });
