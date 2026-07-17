import { COHORTE_NON_TROUVEE } from "@/modules/shared/errors/messages";
import { prismaClient } from "@/prisma/client";

export const updateCohorteVAECollectiveOrganism = async ({
  cohorteVaeCollectiveId,
  organismId,
}: {
  cohorteVaeCollectiveId: string;
  organismId: string;
}) => {
  const cohorteVaeCollective =
    await prismaClient.cohorteVaeCollective.findUnique({
      where: {
        id: cohorteVaeCollectiveId,
      },
      include: {
        certificationCohorteVaeCollectives: true,
      },
    });

  if (!cohorteVaeCollective) {
    throw new Error(COHORTE_NON_TROUVEE);
  }

  if (cohorteVaeCollective.status !== "BROUILLON") {
    throw new Error(
      "Impossible de modifier l'aap d'une cohorte si elle n'est pas dans l'état 'BROUILLON'",
    );
  }

  if (!cohorteVaeCollective.certificationCohorteVaeCollectives.length) {
    throw new Error(
      "Impossible de modifier l'aap d'une cohorte si la certification n'est pas définie",
    );
  }

  return prismaClient.cohorteVaeCollective.update({
    where: {
      id: cohorteVaeCollectiveId,
    },
    data: {
      organismId,
    },
  });
};
