import { prismaClient } from "../../../prisma/client";

export const deleteCohorteVAECollective = async ({
  cohorteVaeCollectiveId,
}: {
  cohorteVaeCollectiveId: string;
}) => {
  const cohorte = await prismaClient.cohorteVaeCollective.findUnique({
    where: {
      id: cohorteVaeCollectiveId,
    },
  });

  if (!cohorte) {
    throw new Error("Cohorte non trouvée");
  }

  if (cohorte.status !== "BROUILLON") {
    throw new Error(
      "Impossible de supprimer si elle n'est plus à l'état brouillon",
    );
  }

  return prismaClient.cohorteVaeCollective.delete({
    where: {
      id: cohorteVaeCollectiveId,
    },
  });
};
