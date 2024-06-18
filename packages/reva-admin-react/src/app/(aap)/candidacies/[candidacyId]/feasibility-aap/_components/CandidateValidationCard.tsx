import { DefaultCandidacySectionCard } from "@/components/card/candidacy-section-card/DefaultCandidacySectionCard";
import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { useParams } from "next/navigation";
import { useCandidateValidationCard } from "./candidateValidationCard.hook";

export const CandidateValidationCard = () => {
  const { candidacyId } = useParams();
  const { isDematerializedFeasibilityFileComplete } =
    useCandidateValidationCard();
  const completed = false;
  return (
    <div>
      <hr />
      <h2>Récapitulatif et envoi du dossier au candidat</h2>
      <DefaultCandidacySectionCard
        title="Validation du candidat"
        titleIconClass="fr-icon-success-fill"
        status={completed ? "COMPLETED" : "TO_COMPLETE"}
        isEditable
        disabled={!isDematerializedFeasibilityFileComplete}
        buttonOnClickHref={`/candidacies/${candidacyId}/feasibility-aap/candidate-validation`}
      >
        {!isDematerializedFeasibilityFileComplete && (
          <SmallNotice>
            Vous devez remplir tous les éléments du dossier de faisabilité avant
            de l'envoyer au candidat pour validation.
          </SmallNotice>
        )}
      </DefaultCandidacySectionCard>
    </div>
  );
};
