import { DefaultCandidacySectionCard } from "@/components/card/candidacy-section-card/DefaultCandidacySectionCard";
import { useParams } from "next/navigation";
import { SmallNotice } from "@/components/small-notice/SmallNotice";

export const CandidateValidationCard = () => {
  const { candidacyId } = useParams();
  const completed = false;
  const disabled = true;

  return (
    <div>
      <hr />
      <h2>Récapitulatif et envoi du dossier au candidat</h2>
      <DefaultCandidacySectionCard
        title="Validation du candidat"
        titleIconClass="fr-icon-success-fill"
        status={completed ? "COMPLETED" : "TO_COMPLETE"}
        isEditable
        disabled={disabled}
        buttonOnClickHref={`/candidacies/${candidacyId}/feasibility-aap/candidate-validation`}
      >
        {disabled && (
          <SmallNotice>
            Vous devez remplir tous les éléments du dossier de faisabilité avant
            de l’envoyer au candidat pour validation.
          </SmallNotice>
        )}
      </DefaultCandidacySectionCard>
    </div>
  );
};
