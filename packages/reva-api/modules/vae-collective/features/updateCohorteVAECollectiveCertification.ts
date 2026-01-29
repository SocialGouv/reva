import { isOrganismAttachedToCertifications } from "@/modules/organism/features/isOrganismAttachedToCertifications";
import { prismaClient } from "@/prisma/client";

import { getCohorteVAECollectiveById } from "./getCohorteVAECollectiveById";

export const updateCohorteVAECollectiveCertification = async ({
  cohorteVaeCollectiveId,
  certificationIds,
}: {
  cohorteVaeCollectiveId: string;
  certificationIds: string[];
}) => {
  const cohorteVaeCollective = await getCohorteVAECollectiveById({
    cohorteVaeCollectiveId,
  });

  if (!cohorteVaeCollective) {
    throw new Error("Cohorte non trouvée");
  }

  if (cohorteVaeCollective.status !== "BROUILLON") {
    throw new Error(
      "Impossible de modifier la certification d'une cohorte si elle n'est pas dans l'état 'BROUILLON'",
    );
  }

  // reset the organism if it is not attached to all the cohorte certifications
  let resetOrganism = false;
  if (cohorteVaeCollective.organismId) {
    if (
      !(await isOrganismAttachedToCertifications({
        organismId: cohorteVaeCollective.organismId,
        certificationIds,
      }))
    ) {
      resetOrganism = true;
    }
  }

  await prismaClient.$transaction(async (tx) => {
    await tx.certificationCohorteVaeCollective.deleteMany({
      where: {
        cohorteVaeCollectiveId,
      },
    });
    await tx.certificationCohorteVaeCollective.createMany({
      data: certificationIds.map((certificationId) => ({
        cohorteVaeCollectiveId,
        certificationId,
      })),
    });
    if (resetOrganism) {
      await tx.cohorteVaeCollective.update({
        where: {
          id: cohorteVaeCollectiveId,
        },
        data: {
          organismId: null,
        },
      });
    }
  });

  return cohorteVaeCollective;
};
