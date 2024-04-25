import {
  addYears,
  isAfter,
  isBefore,
  startOfDay,
  startOfToday,
} from "date-fns";
import { prismaClient } from "../../../prisma/client";

export const setReadyForJuryEstimatedAt = async ({
  candidacyId,
  readyForJuryEstimatedAt,
}: {
  candidacyId: string;
  readyForJuryEstimatedAt: Date;
}) => {
  const now = startOfToday();

  if (isBefore(readyForJuryEstimatedAt, now)) {
    throw new Error("La date prévisionnelle ne peut pas être dans le passé.");
  }

  if (isAfter(startOfDay(readyForJuryEstimatedAt), addYears(now, 2))) {
    throw new Error(
      "La date prévisionnelle doit être comprise dans les deux prochaines années",
    );
  }

  const candidacy = await prismaClient.candidacy.findUnique({
    where: { id: candidacyId },
  });

  if (!candidacy) {
    throw new Error("Cette candidature n'existe pas");
  }

  return prismaClient.candidacy.update({
    where: { id: candidacyId },
    data: {
      readyForJuryEstimatedAt,
    },
  });
};
