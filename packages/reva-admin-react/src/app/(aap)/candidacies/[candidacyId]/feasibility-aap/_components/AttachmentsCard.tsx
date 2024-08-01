import { DefaultCandidacySectionCard } from "@/components/card/candidacy-section-card/DefaultCandidacySectionCard";
import { useParams } from "next/navigation";

export const AttachmentsCard = ({
  attachmentsPartComplete,
  isEditable,
}: {
  attachmentsPartComplete?: boolean;
  isEditable: boolean;
}) => {
  const { candidacyId } = useParams();
  return (
    <DefaultCandidacySectionCard
      title="Pièces jointes"
      titleIconClass="fr-icon-attachment-fill"
      status={attachmentsPartComplete ? "COMPLETED" : "TO_COMPLETE"}
      isEditable={isEditable}
      buttonOnClickHref={`/candidacies/${candidacyId}/feasibility-aap/attachments`}
    />
  );
};
