import { DematerializedFeasibilityFile } from "@prisma/client";

export const checkIsDFFReadyToBeSentToCertificationAuthorityById = async ({
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
    swornStatementFileId,
  } = dematerializedFeasibilityFile;

  return (
    attachmentsPartComplete &&
    certificationPartComplete &&
    competenceBlocsPartCompletion === "COMPLETED" &&
    prerequisitesPartComplete &&
    !!aapDecision &&
    !!swornStatementFileId
  );
};
