import { DematerializedFeasibilityFile } from "@prisma/client";

export const checkIsDFFReadyToBeSentToCandidateById = async ({
  dematerializedFeasibilityFile,
}: {
  dematerializedFeasibilityFile: DematerializedFeasibilityFile;
}) => {
  const {
    attachmentsPartComplete,
    certificationPartComplete,
    competenceBlocsPartCompletion,
    prerequisitesPartComplete,
    aapDecision,
  } = dematerializedFeasibilityFile;

  return (
    attachmentsPartComplete &&
    certificationPartComplete &&
    competenceBlocsPartCompletion === "COMPLETED" &&
    prerequisitesPartComplete &&
    !!aapDecision
  );
};
