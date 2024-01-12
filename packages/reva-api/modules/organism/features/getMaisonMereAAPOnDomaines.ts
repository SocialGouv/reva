import { prismaClient } from "../../../prisma/client";

export const getMaisonMereAAPOnDomaines = ({
  maisonMereAAPId,
}: {
  maisonMereAAPId: string;
}) =>
  prismaClient.maisonMereAAPOnDomaine.findMany({ where: { maisonMereAAPId } });
