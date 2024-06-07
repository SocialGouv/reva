import { prismaClient } from "../../../prisma/client";
import { DematerializedFeasibilityFileCreateOrUpdateDecisionInput } from "../dematerialized-feasibility-file.types";
import { getDematerializedFeasibilityFileByCandidacyId } from "./getDematerializedFeasibilityFileByCandidacyId";
import { getDematerializedFeasibilityFileWithPrerequisitesByCandidacyId } from "./getDematerializedFeasibilityFileWithPrerequisitesByCandidacyId";

export const createOrUpdateDecision = async ({
  candidacyId,
  decision,
  decisionComment,
}: DematerializedFeasibilityFileCreateOrUpdateDecisionInput) => {
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
      decision,
      decisionComment,
      decisionSentAt: new Date(),
    },
  });

  return getDematerializedFeasibilityFileByCandidacyId({
    candidacyId,
  });
};
