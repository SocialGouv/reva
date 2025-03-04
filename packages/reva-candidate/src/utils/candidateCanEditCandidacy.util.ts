import { CandidacyStatusStep } from "@/graphql/generated/graphql";

// Un candidat peut éditer son dossier de candidature tant qu'il n'a pas confirmé son parcours
// et que la candidature n'est pas abandonnée
export const candidateCanEditCandidacy = ({
  candidacyStatus,
  candidacyDropOut,
}: {
  candidacyStatus: CandidacyStatusStep;
  candidacyDropOut: boolean;
}): boolean => {
  return (
    (candidacyStatus === "PROJET" ||
      candidacyStatus === "VALIDATION" ||
      candidacyStatus === "PRISE_EN_CHARGE" ||
      candidacyStatus === "PARCOURS_ENVOYE") &&
    !candidacyDropOut
  );
};
