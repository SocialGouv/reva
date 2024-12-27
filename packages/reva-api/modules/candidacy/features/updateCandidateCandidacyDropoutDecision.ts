import { prismaClient } from "../../../prisma/client";

export const updateCandidateCandidacyDropoutDecision = async ({
  candidacyId,
  dropOutConfirmed,
}: {
  candidacyId: string;
  dropOutConfirmed: Date;
}) => {
  const dropOut = await prismaClient.candidacyDropOut.findUnique({
    where: { candidacyId },
  });

  if (!dropOut) {
    throw new Error("Aucun abandon trouvé pour cette candidature");
  }

  if (dropOut.dropOutConfirmedByCandidate) {
    throw new Error(
      "La décision d'abandon a déjà été confirmée par le candidat",
    );
  }

  if (dropOutConfirmed) {
    const candidacy = await prismaClient.candidacy.update({
      where: { id: candidacyId },
      data: {
        candidacyDropOut: { update: { dropOutConfirmedByCandidate: true } },
      },
    });
    return candidacy;
  } else {
    const candidacy = await prismaClient.candidacy.update({
      where: { id: candidacyId },
      data: {
        candidacyDropOut: { delete: true },
      },
    });
    return candidacy;
  }
};
