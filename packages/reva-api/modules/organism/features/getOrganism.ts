import { prismaClient } from "../../../prisma/client";
import { Organism } from "../organism.types";

export const getOrganismById = async ({
  organismId,
}: {
  organismId: string;
}): Promise<Organism> => {
  const organism = await prismaClient.organism.findUnique({
    where: { id: organismId },
  });

  if (!organism) {
    throw new Error("Organisme non trouvé");
  }

  return organism;
};
