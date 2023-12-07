import { prismaClient } from "../../../prisma/client";
import { Organism } from "../organism.types";

export const getOrganismBySiretOrLabel = ({
  siret,
  label,
}: {
  siret?: string;
  label?: string;
}): Promise<Organism[]> =>
  prismaClient.organism.findMany({
    where: { siret, label },
  });
