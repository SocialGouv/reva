import { prismaClient } from "../../../prisma/client";

export const checkIsDFFCompletedById = async ({
  dematerializedFeasibilityFileId,
}: {
  dematerializedFeasibilityFileId: string;
}) => {
  const dematerializedFeasibilityFile =
    await prismaClient.dematerializedFeasibilityFile.findFirst({
      where: { id: dematerializedFeasibilityFileId },
    });

  if (!dematerializedFeasibilityFile) {
    throw new Error("Dematerialized feasibility file not found");
  }
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
