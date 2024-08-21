import { createCandidacy } from "../../candidacy/features/createCandidacy";
import { getFirstActiveCandidacyByCandidateId } from "../../candidacy/features/getFirstActiveCandidacyByCandidateId";
import { getCandidateByKeycloakId } from "./getCandidateByKeycloakId";

export const getCandidateByKeycloakIdAndCreateCandidacyIfNoActiveOneExists =
  async ({ keycloakId }: { keycloakId: string }) => {
    const candidate = await getCandidateByKeycloakId({ keycloakId });
    if (!candidate) {
      throw new Error("Candidat non trouvé");
    }
    const activeCandidacy = await getFirstActiveCandidacyByCandidateId({
      candidateId: candidate.id,
    });

    if (!activeCandidacy) {
      await createCandidacy({
        candidateId: candidate.id,
        departmentId: candidate.departmentId,
      });
    }
    return candidate;
  };
