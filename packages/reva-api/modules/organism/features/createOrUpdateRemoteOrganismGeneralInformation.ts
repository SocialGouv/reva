import { RemoteZone } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";

export const createOrUpdateRemoteOrganismGeneralInformation = async ({
  organismId,
  informationsCommerciales,
  remoteZones,
}: {
  organismId: string;
  informationsCommerciales: {
    nomPublic: string | null;
    telephone: string | null;
    siteInternet: string | null;
    emailContact: string | null;
  };
  remoteZones: RemoteZone[];
}) =>
  prismaClient.$transaction(async (tx) => {
    const organismUpdated = await tx.organism.update({
      where: { id: organismId },
      data: {
        modaliteAccompagnementRenseigneeEtValide: true,
        ...informationsCommerciales,
      },
    });
    await tx.organismOnRemoteZone.deleteMany({ where: { organismId } });
    await tx.organismOnRemoteZone.createMany({
      data: remoteZones.map((r) => ({ organismId, remoteZone: r })),
    });
    return organismUpdated;
  });
