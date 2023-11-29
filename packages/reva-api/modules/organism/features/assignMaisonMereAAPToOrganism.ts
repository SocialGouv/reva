import { prismaClient } from "../../../prisma/client";

export const assignMaisonMereAAPToOrganism = ({
  organismId,
  maisonMereAAPId,
}: {
  organismId: string;
  maisonMereAAPId: string;
}) =>
  prismaClient.organism.update({
    where: { id: organismId },
    data: { maisonMereAAPId },
  });
