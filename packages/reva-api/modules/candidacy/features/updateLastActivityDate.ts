import { isBefore } from "date-fns";
import { prismaClient } from "../../../prisma/client";

export const updateLastActivityDate = async ({
  candidacyId,
  readyForJuryEstimatedAt,
}: {
  candidacyId: string;
  readyForJuryEstimatedAt: Date;
}) => {
  if (isBefore(readyForJuryEstimatedAt, new Date())) {
    throw new Error(
      "La date de préparation pour le jury ne peut être dans le passé",
    );
  }

  return prismaClient.candidacy.update({
    where: { id: candidacyId },
    data: { readyForJuryEstimatedAt, lastActivityDate: new Date() },
  });
};
