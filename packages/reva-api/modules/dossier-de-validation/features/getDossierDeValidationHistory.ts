import { prismaClient } from "@/prisma/client";

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
      OR: [{ decision: "INCOMPLETE" }, { decision: "COMPLETE" }],
    },
    orderBy: { createdAt: "desc" },
  });
