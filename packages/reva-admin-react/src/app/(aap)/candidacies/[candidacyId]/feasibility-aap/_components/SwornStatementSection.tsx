import { useParams } from "next/navigation";

import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { SmallNotice } from "@/components/small-notice/SmallNotice";

export const SwornStatementSection = ({
  sentToCandidateAt,
  isCompleted,
  isEditable,
}: {
  sentToCandidateAt?: Date | null;
  isCompleted: boolean;
  isEditable: boolean;
}) => {
  const { candidacyId } = useParams();

  return (
    <EnhancedSectionCard
      title="Attestation sur l'honneur"
      titleIconClass="fr-icon-success-fill"
      status={isCompleted ? "COMPLETED" : "TO_COMPLETE"}
      isEditable={isEditable}
      disabled={!sentToCandidateAt}
      buttonOnClickHref={`/candidacies/${candidacyId}/feasibility-aap/sworn-statement`}
      data-testid="sworn-statement-section"
    >
      {!sentToCandidateAt && (
        <SmallNotice>
          Ce document est obligatoire pour considérer le dossier de faisabilité
          comme validé par le candidat.
        </SmallNotice>
      )}
    </EnhancedSectionCard>
  );
};
