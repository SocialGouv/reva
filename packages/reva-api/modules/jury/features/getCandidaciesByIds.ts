import { getCandidaciesFromIds } from "../../candidacy/database/candidacies";

export const getCandidaciesByIds = async ({
  candidacyIds,
}: {
  candidacyIds: string[];
}) => {
  return getCandidaciesFromIds(candidacyIds);
};
