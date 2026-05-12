import { prismaClient } from "@/prisma/client";

export const deleteLieuAccueil = async ({
  maisonMereAAPId,
  organismId,
}: {
  maisonMereAAPId: string;
  organismId: string;
}) => {
  const organism = await prismaClient.organism.findUnique({
    where: { id: organismId },
  });
  if (!organism) {
    throw new Error("L'organisme n'a pas été trouvé");
  }

  if (organism.maisonMereAAPId !== maisonMereAAPId) {
    throw new Error("L'organisme n'appartient pas à la maison mère");
  }

  if (organism.modaliteAccompagnement !== "LIEU_ACCUEIL") {
    throw new Error("L'organisme n'est pas un lieu d'accueil");
  }

  const organismHasCandidacies = await prismaClient.organism.findUnique({
    where: {
      id: organismId,
      candidacies: { some: {} },
    },
  });

  if (organismHasCandidacies) {
    throw new Error(
      "Impossible de supprimer le lieu d'accueil car il a des candidatures",
    );
  }

  await prismaClient.organism.delete({ where: { id: organismId } });
};
