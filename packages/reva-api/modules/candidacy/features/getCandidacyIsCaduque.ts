import { subDays } from "date-fns";

import {
  CADUCITE_THRESHOLD_DAYS,
  WHERE_CLAUSE_CANDIDACY_CADUQUE_AND_ACTUALISATION,
} from "@/modules/shared/candidacy/candidacyCaducite";
import { prismaClient } from "@/prisma/client";

export const getCandidacyIsCaduque = async ({
  candidacyId,
}: {
  candidacyId: string;
}): Promise<boolean> => {
  const dateThresholdCandidacyIsCaduque = subDays(
    new Date(),
    CADUCITE_THRESHOLD_DAYS,
  );

  const candidacy = await prismaClient.candidacy.findFirst({
    where: {
      id: candidacyId,
      ...WHERE_CLAUSE_CANDIDACY_CADUQUE_AND_ACTUALISATION,
      lastActivityDate: {
        lte: dateThresholdCandidacyIsCaduque,
      },
    },
  });

  return !!candidacy;
};
