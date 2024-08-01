import { getCandidateWithCandidacyFromKeycloakId } from "../database/candidates";

export const getCandidateWithCandidacy = async ({
  keycloakId,
}: {
  keycloakId: string;
}) => {
  const candidate = await getCandidateWithCandidacyFromKeycloakId(keycloakId);
  return candidate
    ? { ...candidate, candidacy: candidate.candidacies[0] }
    : null;
};
