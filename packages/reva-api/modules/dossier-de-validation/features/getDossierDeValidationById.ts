import { prismaClient } from "../../../prisma/client";

export const getDossierDeValidationById = ({
  dossierDeValidationId,
}: {
  dossierDeValidationId: string;
}) =>
  prismaClient.dossierDeValidation.findFirst({
    where: {
      id: dossierDeValidationId,
    },
  });
