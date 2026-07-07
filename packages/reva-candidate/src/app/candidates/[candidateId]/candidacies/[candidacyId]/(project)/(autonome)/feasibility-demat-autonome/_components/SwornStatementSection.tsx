import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { SmallNotice } from "@/components/small-notice/SmallNotice";

export const SwornStatementSection = ({
  isCompleted,
  isEditable,
}: {
  isCompleted: boolean;
  isEditable: boolean;
}) => {
  const status = isCompleted ? "COMPLETED" : "TO_COMPLETE";

  return (
    <EnhancedSectionCard
      title="Attestation sur l'honneur"
      titleIconClass="fr-icon-success-fill"
      status={status}
      isEditable={isEditable}
      buttonOnClickHref={`./sworn-statement`}
      data-testid="sworn-statement-section"
    >
      {!isCompleted && (
        <SmallNotice>
          Ce document est obligatoire pour considérer le dossier de faisabilité
          comme validé.
        </SmallNotice>
      )}
    </EnhancedSectionCard>
  );
};
