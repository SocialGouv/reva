import { DefaultCandidacySectionCard } from "@/components/card/candidacy-section-card/DefaultCandidacySectionCard";
import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { useParams } from "next/navigation";

export const SwornStatementCard = ({
  sentToCandidateAt,
}: {
  sentToCandidateAt?: Date | null;
}) => {
  const { candidacyId } = useParams();

  return (
    <DefaultCandidacySectionCard
      title="Validation du candidat"
      titleIconClass="fr-icon-success-fill"
      status={"TO_COMPLETE"}
      isEditable
      disabled={!sentToCandidateAt}
      buttonOnClickHref={`/candidacies/${candidacyId}/feasibility-aap/sworn-statement`}
    >
      {!sentToCandidateAt && (
        <SmallNotice>
          Vous devez remplir tous les éléments du dossier de faisabilité avant
          de l'envoyer au candidat pour validation.
        </SmallNotice>
      )}
    </DefaultCandidacySectionCard>
  );
};
