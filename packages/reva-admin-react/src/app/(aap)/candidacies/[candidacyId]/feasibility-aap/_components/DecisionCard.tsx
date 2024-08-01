import { CustomErrorBadge } from "@/components/badge/custom-error-badge/CustomErrorBadge";
import {
  BadgeToComplete,
  DefaultCandidacySectionCard,
} from "@/components/card/candidacy-section-card/DefaultCandidacySectionCard";
import { DfFileAapDecision } from "@/graphql/generated/graphql";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { useParams } from "next/navigation";

export const DecisionCard = ({
  aapDecision,
  aapDecisionComment,
  isEditable,
}: {
  aapDecision: DfFileAapDecision | null;
  aapDecisionComment: string | null;
  isEditable: boolean;
}) => {
  const { candidacyId } = useParams();

  const DecisionBadge = () => {
    if (aapDecision === "FAVORABLE") {
      return (
        <Badge severity="success" noIcon>
          Favorable
        </Badge>
      );
    }
    if (aapDecision === "UNFAVORABLE") {
      return <CustomErrorBadge label="Non favorable" />;
    }

    return <BadgeToComplete />;
  };

  return (
    <DefaultCandidacySectionCard
      title="Avis sur la faisabilité"
      titleIconClass="fr-icon-thumb-up-fill"
      status={aapDecision ? "COMPLETED" : "TO_COMPLETE"}
      isEditable={isEditable}
      buttonOnClickHref={`/candidacies/${candidacyId}/feasibility-aap/decision`}
      CustomBadge={<DecisionBadge />}
    >
      {aapDecisionComment && <p className="md:pl-10">“{aapDecisionComment}”</p>}
    </DefaultCandidacySectionCard>
  );
};
