import { prismaClient } from "../../../prisma/client";

export const signalDossierDeValidationProblem = ({
  dossierDeValidationId,
  decisionComment,
}: {
  dossierDeValidationId: string;
  decisionComment: string;
}) =>
  prismaClient.dossierDeValidation.update({
    where: { id: dossierDeValidationId, isActive: true },
    data: { decisionComment, decision: "INCOMPLETE" },
  });
