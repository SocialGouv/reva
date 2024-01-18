import { prismaClient } from "../../../prisma/client";

export const setReadyForJuryEstimatedAt = async (params: {
  candidacyId: string;
  readyForJuryEstimatedAt: Date;
}) => {
  const candidacy = await prismaClient.candidacy.findUnique({
    where: { id: params.candidacyId },
  });

  if (!candidacy) {
    throw new Error("Cette candidature n'existe pas");
  }

  if (candidacy.readyForJuryEstimatedAt !== null) {
    throw new Error("Une date prévisionnelle est déjà renseignée");
  }

  return prismaClient.candidacy.update({
    where: { id: params.candidacyId },
    data: {
      readyForJuryEstimatedAt: params.readyForJuryEstimatedAt,
    },
  });
};
