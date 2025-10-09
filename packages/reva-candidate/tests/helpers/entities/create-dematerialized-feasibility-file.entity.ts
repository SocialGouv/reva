import { DematerializedFeasibilityFile } from "@/graphql/generated/graphql";

export const createDematerializedFeasibilityFileEntity = (
  options?: Partial<DematerializedFeasibilityFile>,
): Partial<DematerializedFeasibilityFile> => {
  const { sentToCandidateAt, candidateConfirmationAt } = options || {};

  return {
    id: "1",
    sentToCandidateAt: sentToCandidateAt || null,
    candidateConfirmationAt: candidateConfirmationAt || null,
  };
};
