import { prismaClient } from "@/prisma/client";

import { DematerializedFeasibilityFileCreateOrUpdateAapDecisionInput } from "../dematerialized-feasibility-file.types";

import { generateAndUploadFeasibilityFileByCandidacyId } from "./generateAndUploadFeasibilityFileByCandidacyId";
import { getDematerializedFeasibilityFileByCandidacyId } from "./getDematerializedFeasibilityFileByCandidacyId";
import { getDematerializedFeasibilityFileWithPrerequisitesByCandidacyId } from "./getDematerializedFeasibilityFileWithPrerequisitesByCandidacyId";
import { resetDFFSentToCandidateState } from "./resetDFFSentToCandidateState";

export const createOrUpdateAapDecision = async ({
  candidacyId,
  input: { aapDecision, aapDecisionComment },
}: {
  input: DematerializedFeasibilityFileCreateOrUpdateAapDecisionInput;
  candidacyId: string;
}) => {
  const dFF =
    await getDematerializedFeasibilityFileWithPrerequisitesByCandidacyId({
      candidacyId,
    });

  if (!dFF) {
    throw new Error("Dossier de faisabilité dématérialisé non trouvé");
  }

  await prismaClient.dematerializedFeasibilityFile.update({
    where: {
      id: dFF.id,
    },
    data: {
      aapDecision,
      aapDecisionComment,
    },
  });

  if (dFF.sentToCandidateAt) {
    await resetDFFSentToCandidateState(dFF);
  }

  try {
    await generateAndUploadFeasibilityFileByCandidacyId(candidacyId);
  } catch (error) {
    console.error(error);
  }

  return getDematerializedFeasibilityFileByCandidacyId({
    candidacyId,
  });
};
