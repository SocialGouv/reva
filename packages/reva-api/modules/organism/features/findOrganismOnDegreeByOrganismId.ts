import { prismaClient } from "../../../prisma/client";

export const findOrganismOnDegreeByOrganismId = ({
  organismId,
}: {
  organismId: string;
}) => prismaClient.organismOnDegree.findMany({ where: { organismId } });
