import { DefaultCandidacySectionCard } from "@/components/card/candidacy-section-card/DefaultCandidacySectionCard";
import { useParams } from "next/navigation";

export const AttachmentsCard = ({
  attachmentsPartComplete,
  isFeasibilityEditable,
}: {
  attachmentsPartComplete?: boolean;
  isFeasibilityEditable: boolean;
}) => {
  const { candidacyId } = useParams();
  return (
    <DefaultCandidacySectionCard
      title="Pièces jointes"
      titleIconClass="fr-icon-attachment-fill"
      status={attachmentsPartComplete ? "COMPLETED" : "TO_COMPLETE"}
      isEditable={isFeasibilityEditable}
      buttonOnClickHref={`/candidacies/${candidacyId}/feasibility-aap/attachments`}
    />
  );
};
