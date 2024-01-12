import { prismaClient } from "../../../prisma/client";

export const getMaisonMereAAPOnConventionCollectives = ({
  maisonMereAAPId,
}: {
  maisonMereAAPId: string;
}) =>
  prismaClient.maisonMereAAPOnConventionCollective.findMany({
    where: { maisonMereAAPId },
  });
