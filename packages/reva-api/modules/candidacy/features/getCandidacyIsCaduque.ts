import { addDays, isBefore } from "date-fns";
import { prismaClient } from "../../../prisma/client";
import { getCandidacyById } from "./getCandidacyById";

const CADUQUITE_THRESHOLD_DAYS = 183;

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
    CADUQUITE_THRESHOLD_DAYS,
  );

  const lastActiveStatus = candidacy?.status;
  const isLastActiveStatusValidForActualisationBanner =
    lastActiveStatus === "DOSSIER_FAISABILITE_RECEVABLE" ||
    lastActiveStatus === "DOSSIER_DE_VALIDATION_SIGNALE";

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
