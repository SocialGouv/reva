import { DefaultCandidacySectionCard } from "@/components/card/candidacy-section-card/DefaultCandidacySectionCard";
import { useParams } from "next/navigation";

export const AttachmentsCard = () => {
  const { candidacyId } = useParams();
  const attachementsBlockCompleted = false;
  return (
    <DefaultCandidacySectionCard
      title="Pièces jointes"
      titleIconClass="fr-icon-attachment-fill"
      status={attachementsBlockCompleted ? "COMPLETED" : "TO_COMPLETE"}
      isEditable
      buttonOnClickHref={`/candidacies/${candidacyId}/feasibility-aap/attachments`}
    ></DefaultCandidacySectionCard>
  );
};
