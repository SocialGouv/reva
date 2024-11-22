import { prismaClient } from "../../../prisma/client";
import { UpdateCertificationStructureInput } from "../referential.types";

export const updateCertificationStructureInput = async ({
  certificationId,
  certificationAuthorityStructureId,
}: UpdateCertificationStructureInput) =>
  prismaClient.certification.update({
    where: { id: certificationId },
    data: { certificationAuthorityStructureId },
  });
