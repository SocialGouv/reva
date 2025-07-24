import { prismaClient } from "@/prisma/client";

export const updateCertificationAuthorityStructure = async ({
  certificationAuthorityStructureId,
  certificationAuthorityStructureLabel,
}: {
  certificationAuthorityStructureId: string;
  certificationAuthorityStructureLabel: string;
}) =>
  prismaClient.certificationAuthorityStructure.update({
    where: { id: certificationAuthorityStructureId },
    data: { label: certificationAuthorityStructureLabel },
  });
