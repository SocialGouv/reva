import { prismaClient } from "../../../prisma/client";

export const getMaisonMereAAPByGestionnaireAccountId = ({
  gestionnaireAccountId,
}: {
  gestionnaireAccountId: string;
}) =>
  prismaClient.maisonMereAAP.findFirst({
    where: { gestionnaireAccountId },
  });
