import { prismaClient } from "../../../prisma/client";

export const assignMaisonMereAAPToOrganism = ({
  organismId,
  maisonMereAAPId,
  isActive,
}: {
  organismId: string;
  maisonMereAAPId: string;
  isActive: boolean;
}) =>
  prismaClient.organism.update({
    where: { id: organismId },
    data: { maisonMereAAPId, isActive },
  });
