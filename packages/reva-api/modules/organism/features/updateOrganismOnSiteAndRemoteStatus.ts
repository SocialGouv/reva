import { prismaClient } from "../../../prisma/client";
import { RemoteZone } from "../organism.types";

export const updateOrganismOnSiteAndRemoteStatus = async ({
  organismId,
  isOnSite,
  remoteZones,
}: {
  organismId: string;
  isOnSite: boolean;
  remoteZones: RemoteZone[];
}) => {
  if (!organismId) {
    throw new Error("OrganismId vide");
  }
  const [organism] = await prismaClient.$transaction([
    prismaClient.organism.update({
      where: { id: organismId },
      data: { isOnSite },
    }),
    prismaClient.organismOnRemoteZone.deleteMany({ where: { organismId } }),
    prismaClient.organismOnRemoteZone.createMany({
      data: remoteZones.map((r) => ({ organismId, remoteZone: r })),
    }),
  ]);

  return organism;
};
