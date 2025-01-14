import { prismaClient } from "../../../prisma/client";
import { OrganismInformationsCommerciales } from "../organism.types";
import { getLLToEarthFromZip } from "./getLLToEarthFromZip";
import { updateOrganismLLToEarth } from "./updateOrganismLLToEarth";

export const createOrUpdateOnSiteOrganismGeneralInformation = async ({
  organismId,
  informationsCommerciales,
}: {
  organismId: string;
  informationsCommerciales: OrganismInformationsCommerciales;
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

  return organismUpdated;
};
