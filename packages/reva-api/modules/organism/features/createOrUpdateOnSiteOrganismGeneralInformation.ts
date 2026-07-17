import {
  AAPAuditLogUserInfo,
  logAAPAuditEvent,
} from "@/modules/aap-log/features/logAAPAuditEvent";
import { ORGANISME_PAS_ETE_TROUVE } from "@/modules/shared/errors/messages";
import { prismaClient } from "@/prisma/client";

import { OrganismInformationsCommerciales } from "../organism.types";

import { assertNoDuplicateLieuAccueilAddress } from "./assertNoDuplicateLieuAccueilAddress";
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
  const current = await prismaClient.organism.findUnique({
    where: { id: organismId },
    select: {
      id: true,
      maisonMereAAPId: true,
      adresseNumeroEtNomDeRue: true,
      adresseVille: true,
    },
  });

  if (!current) {
    throw new Error(ORGANISME_PAS_ETE_TROUVE);
  }

  const targetStreet =
    informationsCommerciales.adresseNumeroEtNomDeRue ??
    current.adresseNumeroEtNomDeRue;
  const targetCity =
    informationsCommerciales.adresseVille ?? current.adresseVille;

  if (current.maisonMereAAPId) {
    await assertNoDuplicateLieuAccueilAddress({
      maisonMereAAPId: current.maisonMereAAPId,
      street: targetStreet,
      city: targetCity,
      excludeOrganismId: organismId,
    });
  }

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
      details: { organismId: organismId, organismLabel: organismUpdated.label },
      userInfo,
    });
  }

  return organismUpdated;
};
