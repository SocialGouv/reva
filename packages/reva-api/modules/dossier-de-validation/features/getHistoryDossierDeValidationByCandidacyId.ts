import { prismaClient } from "../../../prisma/client";

export const getHistoryDossierDeValidationByCandidacyId = ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.dossierDeValidation.findMany({
    where: { isActive: false, candidacyId },
  });
