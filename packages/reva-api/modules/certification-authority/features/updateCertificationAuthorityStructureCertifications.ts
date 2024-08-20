import { prismaClient } from "../../../prisma/client";

export const updateCertificationAuthorityStructureCertifications = ({
  certificationAuthorityStructureId,
  certificationIds,
}: {
  certificationAuthorityStructureId: string;
  certificationIds: string[];
}) =>
  prismaClient.certificationAuthorityStructure.update({
    where: { id: certificationAuthorityStructureId },
    data: { certifications: { set: certificationIds.map((id) => ({ id })) } },
  });
