import { prismaClient } from "../../../prisma/client";

export const getDossierDeValidationHistory = ({
  dossierDeValidationId,
  candidacyId,
}: {
  dossierDeValidationId: string;
  candidacyId: string;
}) =>
  prismaClient.dossierDeValidation.findMany({
    where: {
      candidacyId,
      id: { not: dossierDeValidationId },
      decision: "INCOMPLETE",
    },
    orderBy: { createdAt: "desc" },
  });
