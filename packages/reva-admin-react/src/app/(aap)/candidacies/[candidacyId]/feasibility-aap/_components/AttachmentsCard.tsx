import { DefaultCandidacySectionCard } from "@/components/card/candidacy-section-card/DefaultCandidacySectionCard";
import { useParams } from "next/navigation";
import { useAttachmentsCard } from "./attachmentsCard.hook";

export const AttachmentsCard = () => {
  const { candidacyId } = useParams();
  const { attachmentsPartComplete } = useAttachmentsCard();
  return (
    <DefaultCandidacySectionCard
      title="Pièces jointes"
      titleIconClass="fr-icon-attachment-fill"
      status={attachmentsPartComplete ? "COMPLETED" : "TO_COMPLETE"}
      isEditable
      buttonOnClickHref={`/candidacies/${candidacyId}/feasibility-aap/attachments`}
    />
  );
};
