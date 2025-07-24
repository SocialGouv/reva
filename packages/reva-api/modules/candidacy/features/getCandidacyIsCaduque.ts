import { subDays } from "date-fns";

import { prismaClient } from "../../../prisma/client";
import {
  CADUCITE_THRESHOLD_DAYS,
  WHERE_CLAUSE_CANDIDACY_CADUQUE_AND_ACTUALISATION,
} from "../../shared/candidacy/candidacyCaducite";

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
