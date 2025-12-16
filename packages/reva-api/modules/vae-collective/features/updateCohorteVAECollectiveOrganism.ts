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
    throw new Error("Cohorte non trouvée");
  }

  if (cohorteVaeCollective.status !== "BROUILLON") {
    throw new Error(
      "Impossible de modifier la certification d'une cohorte si elle n'est pas dans l'état 'BROUILLON'",
    );
  }

  if (!cohorteVaeCollective.certificationCohorteVaeCollectives.length) {
    throw new Error(
      "Impossible de modifier l'aap d'une cohorte si la certification n'est pas définie",
    );
  }

  if (cohorteVaeCollective.certificationCohorteVaeCollectives.length > 1) {
    throw new Error(
      "La mise à jour de l'aap d'une cohorte avec plusieurs certifications n'est pas possible",
    );
  }

  const certificationCohorteVaeCollective =
    cohorteVaeCollective.certificationCohorteVaeCollectives[0];

  await prismaClient.$transaction(async (tx) => {
    await tx.certificationCohorteVaeCollectiveOnOrganism.deleteMany({
      where: {
        certificationCohorteVaeCollectiveId:
          certificationCohorteVaeCollective.id,
      },
    });
    await tx.certificationCohorteVaeCollectiveOnOrganism.create({
      data: {
        certificationCohorteVaeCollectiveId:
          certificationCohorteVaeCollective.id,
        organismId,
      },
    });
    await tx.cohorteVaeCollective.update({
      where: {
        id: cohorteVaeCollectiveId,
      },
      data: {
        organismId,
      },
    });
  });

  return cohorteVaeCollective;
};
