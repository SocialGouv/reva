import { prismaClient } from "../../../prisma/client";

export const updateOrganismDegreesAndDomaines = async ({
  organismId,
  degreeIds,
  domaineIds,
}: {
  organismId: string;
  degreeIds: string[];
  domaineIds: string[];
}) => {
  const [, , , , organism] = await prismaClient.$transaction([
    prismaClient.organismOnDegree.deleteMany({ where: { organismId } }),
    prismaClient.organismOnDegree.createMany({
      data: degreeIds.map((degreeId) => ({ organismId, degreeId })),
    }),
    prismaClient.organismOnDomaine.deleteMany({ where: { organismId } }),
    prismaClient.organismOnDomaine.createMany({
      data: domaineIds.map((domaineId) => ({ organismId, domaineId })),
    }),
    prismaClient.organism.findUnique({
      where: { id: organismId },
    }),
  ]);
  return organism;
};
