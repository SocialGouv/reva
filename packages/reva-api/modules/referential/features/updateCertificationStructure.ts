import { prismaClient } from "../../../prisma/client";
import { UpdateCertificationStructureInput } from "../referential.types";

export const updateCertificationStructure = async ({
  certificationId,
  certificationAuthorityStructureId,
}: UpdateCertificationStructureInput) =>
  prismaClient.certification.update({
    where: { id: certificationId },
    data: { certificationAuthorityStructureId },
  });
