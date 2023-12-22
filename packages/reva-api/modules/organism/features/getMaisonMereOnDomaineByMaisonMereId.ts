import { prismaClient } from "../../../prisma/client";

export const getMaisonMereOnDomaineByMaisonMereId = ({
  maisonMereAAPId,
}: {
  maisonMereAAPId: string;
}) =>
  prismaClient.maisonMereAAPOnDomaine.findMany({
    where: { maisonMereAAPId },
  });
