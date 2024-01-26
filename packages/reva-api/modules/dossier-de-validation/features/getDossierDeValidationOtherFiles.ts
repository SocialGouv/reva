import { prismaClient } from "../../../prisma/client";

export const getDossierDeValidationOtherFiles = ({
  dossierDeValidationId,
}: {
  dossierDeValidationId: string;
}) =>
  prismaClient.file.findMany({
    where: {
      DossierDeValidationOtherFiles: { some: { dossierDeValidationId } },
    },
  });
