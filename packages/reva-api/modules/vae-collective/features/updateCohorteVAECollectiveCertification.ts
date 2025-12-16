import { prismaClient } from "@/prisma/client";

import { getCohorteVAECollectiveById } from "./getCohorteVAECollectiveById";

export const updateCohorteVAECollectiveCertification = async ({
  cohorteVaeCollectiveId,
  certificationId,
}: {
  cohorteVaeCollectiveId: string;
  certificationId: string;
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
  await prismaClient.$transaction(async (tx) => {
    await tx.certificationCohorteVaeCollective.deleteMany({
      where: {
        cohorteVaeCollectiveId,
      },
    });
    await tx.certificationCohorteVaeCollective.create({
      data: {
        cohorteVaeCollectiveId,
        certificationId,
      },
    });
    await tx.cohorteVaeCollective.update({
      where: {
        id: cohorteVaeCollectiveId,
      },
      data: {
        organismId: null,
      },
    });
  });

  return cohorteVaeCollective;
};
