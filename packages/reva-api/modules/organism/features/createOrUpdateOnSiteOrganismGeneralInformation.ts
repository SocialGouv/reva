import { prismaClient } from "../../../prisma/client";
import {
  AAPAuditLogUserInfo,
  logAAPAuditEvent,
} from "../../aap-log/features/logAAPAuditEvent";
import { OrganismInformationsCommerciales } from "../organism.types";
import { getLLToEarthFromZip } from "./getLLToEarthFromZip";
import { updateOrganismLLToEarth } from "./updateOrganismLLToEarth";

export const createOrUpdateOnSiteOrganismGeneralInformation = async ({
  organismId,
  informationsCommerciales,
  userInfo,
}: {
  organismId: string;
  informationsCommerciales: OrganismInformationsCommerciales;
  userInfo: AAPAuditLogUserInfo;
}) => {
  const organismUpdated = await prismaClient.$transaction(async (tx) => {
    const organismUpdated = await tx.organism.update({
      where: { id: organismId },
      data: {
        modaliteAccompagnementRenseigneeEtValide: true,
        ...informationsCommerciales,
      },
    });

    return organismUpdated;
  });

  const llToEarth = await getLLToEarthFromZip({
    zip: organismUpdated.adresseCodePostal,
  });

  if (llToEarth) {
    await updateOrganismLLToEarth({
      organismId,
      llToEarth,
    });
  }

  if (organismUpdated.maisonMereAAPId) {
    await logAAPAuditEvent({
      eventType: "ORGANISM_ONSITE_GENERAL_INFORMATION_UPDATED",
      maisonMereAAPId: organismUpdated.maisonMereAAPId,
      details: { organismLabel: organismUpdated.label },
      userInfo,
    });
  }

  return organismUpdated;
};
