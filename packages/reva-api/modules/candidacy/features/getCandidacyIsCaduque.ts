import { addDays, isBefore } from "date-fns";
import { prismaClient } from "../../../prisma/client";
import {
  CADUCITE_THRESHOLD_DAYS,
  CADUCITE_VALID_STATUSES,
} from "../../shared/candidacy/candidacyCaducite";
import { getCandidacyById } from "./getCandidacyById";

export const getCandidacyIsCaduque = async ({
  candidacyId,
}: {
  candidacyId: string;
}): Promise<boolean> => {
  const candidacy = await getCandidacyById({
    candidacyId,
  });

  if (!candidacy?.lastActivityDate) {
    return false;
  }

  const feasibility = await prismaClient.feasibility.findFirst({
    where: {
      candidacyId,
      isActive: true,
    },
  });

  const sixMonthsFromLastActivity = addDays(
    candidacy.lastActivityDate,
    CADUCITE_THRESHOLD_DAYS,
  );

  const lastActiveStatus = candidacy?.status;
  const isLastActiveStatusValidForActualisationBanner =
    CADUCITE_VALID_STATUSES.includes(lastActiveStatus);

  const lastActivityHasNotBeenUpdatedInSixMonths = isBefore(
    sixMonthsFromLastActivity,
    new Date(),
  );

  const isFeasibilityDecisionValid = feasibility?.decision === "ADMISSIBLE";

  return (
    isLastActiveStatusValidForActualisationBanner &&
    lastActivityHasNotBeenUpdatedInSixMonths &&
    isFeasibilityDecisionValid
  );
};
