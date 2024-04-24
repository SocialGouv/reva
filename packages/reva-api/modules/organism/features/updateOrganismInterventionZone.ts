import { getOrganismById } from "./getOrganism";
import { UpdateOrganismInterventionZoneInput } from "../organism.types";
import { prismaClient } from "../../../prisma/client";

export const updateOrganismInterventionZone = async ({
  params: { organismId, interventionZone },
}: {
  params: UpdateOrganismInterventionZoneInput;
}) => {
  await prismaClient.$transaction([
    prismaClient.organismsOnDepartments.deleteMany({
      where: { organismId },
    }),
    prismaClient.organismsOnDepartments.createMany({
      data: interventionZone.map((iz) => ({ organismId, ...iz })),
    }),
  ]);

  return getOrganismById({ organismId });
};
