import { prismaClient } from "../../../prisma/client";
import { Organism } from "../organism.types";

export const getOrganismsByMaisonAAPId = ({
  maisonMereAAPId,
}: {
  maisonMereAAPId: string;
}): Promise<Organism[]> =>
  prismaClient.organism.findMany({
    where: { maisonMereAAPId },
  });
