import { RemoteZone } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";

export const createOrUpdateRemoteOrganismGeneralInformation = async ({
  organismId,
  informationsCommerciales,
  remoteZones,
}: {
  organismId: string;
  informationsCommerciales: {
    nom: string | null;
    telephone: string | null;
    siteInternet: string | null;
    emailContact: string | null;
  };
  remoteZones: RemoteZone[];
}) =>
  prismaClient.$transaction(async (tx) => {
    const organismUpdated = await tx.organismInformationsCommerciales.upsert({
      where: { organismId: organismId },
      create: { ...informationsCommerciales, organismId },
      update: informationsCommerciales,
    });
    await tx.organism.update({
      where: { id: organismId },
      data: { modaliteAccompagnementRenseigneeEtValide: true },
    });
    await tx.organismOnRemoteZone.deleteMany({ where: { organismId } });
    await tx.organismOnRemoteZone.createMany({
      data: remoteZones.map((r) => ({ organismId, remoteZone: r })),
    });
    return organismUpdated;
  });
