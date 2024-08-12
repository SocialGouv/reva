import { prismaClient } from "../../../../prisma/client";
import { DematerializedFeasibilityFileCreateOrUpdateEligibilityRequirementInput } from "../dematerialized-feasibility-file.types";
import { getDematerializedFeasibilityFileByCandidacyId } from "./getDematerializedFeasibilityFileByCandidacyId";
import { getDematerializedFeasibilityFileWithPrerequisitesByCandidacyId } from "./getDematerializedFeasibilityFileWithPrerequisitesByCandidacyId";
import { resetDFFSentToCandidateState } from "./resetDFFSentToCandidateState";

export const createOrUpdateEligibilityRequirement = async ({
  candidacyId,
  input: { eligibilityRequirement, eligibilityValidUntil },
}: {
  input: DematerializedFeasibilityFileCreateOrUpdateEligibilityRequirementInput;
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
      eligibilityRequirement,
      eligibilityValidUntil: eligibilityValidUntil
        ? new Date(eligibilityValidUntil).toISOString()
        : null,
    },
  });

  if (dFF.sentToCandidateAt) {
    await resetDFFSentToCandidateState(dFF);
  }

  return getDematerializedFeasibilityFileByCandidacyId({
    candidacyId,
  });
};
