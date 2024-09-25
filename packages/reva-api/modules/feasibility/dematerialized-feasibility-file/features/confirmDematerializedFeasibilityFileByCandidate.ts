import { prismaClient } from "../../../../prisma/client";
import { DematerializedFeasibilityFileCreateOrUpdateCandidateDecisionInput } from "../dematerialized-feasibility-file.types";

export const confirmDematerializedFeasibilityFileByCandidate = async ({
  dematerializedFeasibilityFileId,
  input,
}: {
  dematerializedFeasibilityFileId: string;
  input: DematerializedFeasibilityFileCreateOrUpdateCandidateDecisionInput;
}) =>
  prismaClient.dematerializedFeasibilityFile.update({
    where: { id: dematerializedFeasibilityFileId },
    data: {
      candidateConfirmationAt: new Date().toISOString(),
      candidateDecisionComment: input.candidateDecisionComment,
    },
  });
