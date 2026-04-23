import { prismaClient } from "@/prisma/client";

export const isCompanySiretAlreadyUsed = async ({
  companySiret,
}: {
  companySiret: string;
}) => {
  const maisonMereAap = await prismaClient.maisonMereAAP.findFirst({
    where: {
      siret: companySiret,
    },
  });
  return !!maisonMereAap;
};
