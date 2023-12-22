import { prismaClient } from "../../../prisma/client";

export const getMaisonMereOnCCNByMaisonMereId = ({
  maisonMereAAPId,
}: {
  maisonMereAAPId: string;
}) =>
  prismaClient.maisonMereAAPOnConventionCollective.findMany({
    where: { maisonMereAAPId },
  });
