import { addMonths, isBefore } from "date-fns";
import { getCandidacyById } from "./getCandidacyById";

export const getCandidacyIsObsolete = async ({
  candidacyId,
}: {
  candidacyId: string;
}): Promise<boolean> => {
  const candidacy = await getCandidacyById({ candidacyId });

  if (!candidacy?.lastActivityDate) {
    return false;
  }

  const sixMonthsFromLastActivity = addMonths(candidacy.lastActivityDate, 6);

  return isBefore(sixMonthsFromLastActivity, new Date());
};
