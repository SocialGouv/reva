import { prismaClient } from "../../../prisma/client";

export const getAgencesByGestionnaireAccountId = ({
  gestionnaireAccountId,
}: {
  gestionnaireAccountId: string;
}) =>
  prismaClient.organism.findMany({
    where: { maisonMereAAP: { gestionnaireAccountId } },
  });
