import { prismaClient } from "@/prisma/client";

export const getMaisonMereAAPByGestionnaireAccountId = ({
  gestionnaireAccountId,
}: {
  gestionnaireAccountId: string;
}) =>
  prismaClient.maisonMereAAP.findUnique({
    where: { gestionnaireAccountId },
  });
