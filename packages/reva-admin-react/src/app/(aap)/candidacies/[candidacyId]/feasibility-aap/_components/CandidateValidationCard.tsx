import { DefaultCandidacySectionCard } from "@/components/card/candidacy-section-card/DefaultCandidacySectionCard";
import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { useParams } from "next/navigation";
import { useCandidateValidationCard } from "./candidateValidationCard.hook";

export const CandidateValidationCard = () => {
  const { candidacyId } = useParams();
  const { isDematerializedFeasibilityFileHasBeenSent } =
    useCandidateValidationCard();
  return (
    <DefaultCandidacySectionCard
      title="Validation du candidat"
      titleIconClass="fr-icon-success-fill"
      status={"TO_COMPLETE"}
      isEditable
      disabled={!isDematerializedFeasibilityFileHasBeenSent}
      buttonOnClickHref={`/candidacies/${candidacyId}/feasibility-aap/candidate-validation`}
    >
      {!isDematerializedFeasibilityFileHasBeenSent && (
        <SmallNotice>
          Vous devez remplir tous les éléments du dossier de faisabilité avant
          de l'envoyer au candidat pour validation.
        </SmallNotice>
      )}
    </DefaultCandidacySectionCard>
  );
};
