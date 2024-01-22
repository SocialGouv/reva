import { prismaClient } from "../../../prisma/client";

export const getActiveDossierDeValidationByCandidacyId = ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.dossierDeValidation.findFirst({
    where: { isActive: true, candidacyId },
  });
