import { RemoteZone } from "@prisma/client";

import {
  AAPAuditLogUserInfo,
  logAAPAuditEvent,
} from "@/modules/aap-log/features/logAAPAuditEvent";
import { prismaClient } from "@/prisma/client";

export const createOrUpdateRemoteOrganismGeneralInformation = async ({
  organismId,
  informationsCommerciales,
  remoteZones,
  userInfo,
}: {
  organismId: string;
  informationsCommerciales: {
    nomPublic: string | null;
    telephone: string | null;
    siteInternet: string | null;
    emailContact: string | null;
  };
  remoteZones: RemoteZone[];
  userInfo: AAPAuditLogUserInfo;
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

    if (organismUpdated.maisonMereAAPId) {
      await logAAPAuditEvent({
        eventType: "ORGANISM_REMOTE_GENERAL_INFORMATION_UPDATED",
        maisonMereAAPId: organismUpdated.maisonMereAAPId,
        userInfo,
        tx,
      });
      return organismUpdated;
    }
  });
