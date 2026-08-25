import { prismaClient } from "@/prisma/client";

export const isCompanySiretAlreadyUsed = async ({
  companySiret,
  excludedMaisonMereAAPId,
}: {
  companySiret: string;
  // Une structure qui met à jour ses informations ne se concurrence pas elle-même.
  excludedMaisonMereAAPId?: string;
}) => {
  const maisonMereAap = await prismaClient.maisonMereAAP.findFirst({
    where: {
      siret: companySiret,
      id: excludedMaisonMereAAPId
        ? { not: excludedMaisonMereAAPId }
        : undefined,
    },
  });
  return !!maisonMereAap;
};
