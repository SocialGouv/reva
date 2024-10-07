import { prismaClient } from "../../../prisma/client";

export const updateMaisonMereAAPFinancingMethods = ({
  maisonMereAAPId,
  isMCFCompatible,
}: {
  maisonMereAAPId: string;
  isMCFCompatible: boolean;
}) =>
  prismaClient.maisonMereAAP.update({
    where: { id: maisonMereAAPId },
    data: { isMCFCompatible },
  });
