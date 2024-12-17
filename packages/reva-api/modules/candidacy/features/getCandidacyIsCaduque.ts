import { addDays, isBefore } from "date-fns";
import { getCandidacyById } from "./getCandidacyById";

const CADUQUITE_THRESHOLD_DAYS = 183;

export const getCandidacyIsCaduque = async ({
  candidacyId,
}: {
  candidacyId: string;
}): Promise<boolean> => {
  const candidacy = await getCandidacyById({ candidacyId });

  if (!candidacy?.lastActivityDate) {
    return false;
  }

  const sixMonthsFromLastActivity = addDays(
    candidacy.lastActivityDate,
    CADUQUITE_THRESHOLD_DAYS,
  );

  return isBefore(sixMonthsFromLastActivity, new Date());
};
