import {
  CandidacyStatusStep,
  TypeAccompagnement,
} from "@/graphql/generated/graphql";

// Un candidat peut éditer son dossier de candidature tant qu'il n'a pas confirmé son parcours
// et que la candidature n'est pas abandonnée.
// Un candidat autonome peut changer de certification lorsque le dossier de faisabilité est incomplet
export const candidateCanEditCandidacy = ({
  candidacyStatus,
  typeAccompagnement,
  candidacyDropOut,
}: {
  candidacyStatus?: CandidacyStatusStep;
  typeAccompagnement?: TypeAccompagnement;
  candidacyDropOut?: boolean;
}): boolean => {
  return (
    (candidacyStatus === "PROJET" ||
      candidacyStatus === "VALIDATION" ||
      candidacyStatus === "PRISE_EN_CHARGE" ||
      candidacyStatus === "PARCOURS_ENVOYE" ||
      (typeAccompagnement === "AUTONOME" &&
        candidacyStatus === "DOSSIER_FAISABILITE_INCOMPLET")) &&
    !candidacyDropOut
  );
};
