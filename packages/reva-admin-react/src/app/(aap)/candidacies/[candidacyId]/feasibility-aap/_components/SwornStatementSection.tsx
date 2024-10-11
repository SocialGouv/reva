import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { useParams } from "next/navigation";

export const SwornStatementSection = ({
  sentToCandidateAt,
  swornStatementFileId,
  isEditable,
}: {
  sentToCandidateAt?: Date | null;
  swornStatementFileId?: string | null;
  isEditable: boolean;
}) => {
  const { candidacyId } = useParams();

  return (
    <EnhancedSectionCard
      title="Attestation sur l'honneur"
      titleIconClass="fr-icon-success-fill"
      status={swornStatementFileId ? "COMPLETED" : "TO_COMPLETE"}
      isEditable={isEditable}
      disabled={!sentToCandidateAt}
      buttonOnClickHref={`/candidacies/${candidacyId}/feasibility-aap/sworn-statement`}
      data-test="sworn-statement-section"
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
