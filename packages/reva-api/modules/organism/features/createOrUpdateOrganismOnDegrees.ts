import { prismaClient } from "../../../prisma/client";

export const createOrUpdateOrganismOnDegrees = async ({
  organismId,
  degreeIds,
}: {
  organismId: string;
  degreeIds: string[];
}) => {
  const t = await prismaClient.$transaction([
    prismaClient.organismOnDegree.deleteMany({ where: { organismId } }),
    prismaClient.organismOnDegree.createMany({
      data: degreeIds.map((degreeId) => ({ organismId, degreeId })),
    }),
    prismaClient.organismOnDegree.findMany({
      where: { organismId },
    }),
  ]);
  return t[2];
};
