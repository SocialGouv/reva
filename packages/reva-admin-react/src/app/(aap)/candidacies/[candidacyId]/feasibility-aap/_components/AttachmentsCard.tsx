import { DefaultCandidacySectionCard } from "@/components/card/candidacy-section-card/DefaultCandidacySectionCard";
import { FancyPreview } from "@/components/fancy-preview/FancyPreview";
import { DffAttachment } from "@/graphql/generated/graphql";
import { useParams } from "next/navigation";

export const AttachmentsCard = ({
  attachmentsPartComplete,
  isEditable,
  attachments,
}: {
  attachmentsPartComplete?: boolean;
  isEditable: boolean;
  attachments: DffAttachment[];
}) => {
  const { candidacyId } = useParams();
  return (
    <DefaultCandidacySectionCard
      title="Pièces jointes"
      titleIconClass="fr-icon-attachment-fill"
      status={attachmentsPartComplete ? "COMPLETED" : "TO_COMPLETE"}
      isEditable={isEditable}
      buttonOnClickHref={`/candidacies/${candidacyId}/feasibility-aap/attachments`}
    >
      {!!attachments.length &&
        attachments.map(({ id, file }) => {
          return (
            file.previewUrl && (
              <FancyPreview
                key={id}
                name={file.name}
                src={file.previewUrl}
                defaultDisplay={false}
                title={file.name}
              />
            )
          );
        })}
    </DefaultCandidacySectionCard>
  );
};
