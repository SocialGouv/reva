import { prismaClient } from "../../../prisma/client";

export const getNiveauDeFormationLePlusEleve = ({
  niveauDeFormationLePlusEleveDegreeId,
}: {
  niveauDeFormationLePlusEleveDegreeId?: string;
}) =>
  niveauDeFormationLePlusEleveDegreeId
    ? prismaClient.degree.findFirst({
        where: { id: niveauDeFormationLePlusEleveDegreeId },
      })
    : null;
