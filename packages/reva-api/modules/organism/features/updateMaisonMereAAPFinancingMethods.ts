import { prismaClient } from "../../../prisma/client";

export const updateMaisonMereAAPFinancingMethods = ({
  maisonMereAAPId,
  isMcfCompatible,
}: {
  maisonMereAAPId: string;
  isMcfCompatible: boolean;
}) =>
  prismaClient.maisonMereAAP.update({
    where: { id: maisonMereAAPId },
    data: { isMcfCompatible },
  });
