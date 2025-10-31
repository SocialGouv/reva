import Badge from "@codegouvfr/react-dsfr/Badge";
import { useParams } from "next/navigation";

import { BadgeToComplete } from "@/components/badge/badge-to-complete/BadgeToComplete";
import { CustomErrorBadge } from "@/components/badge/custom-error-badge/CustomErrorBadge";
import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { SmallNotice } from "@/components/small-notice/SmallNotice";

import { DfFileAapDecision } from "@/graphql/generated/graphql";

export const DecisionSection = ({
  aapDecision,
  aapDecisionComment,
  isEditable,
  disabled,
}: {
  aapDecision: DfFileAapDecision | null;
  aapDecisionComment: string | null;
  isEditable: boolean;
  disabled: boolean;
}) => {
  const { candidacyId } = useParams();

  const DecisionBadge = () => {
    if (aapDecision === "FAVORABLE") {
      return (
        <Badge severity="success" noIcon data-testid="favorable-badge">
          Favorable
        </Badge>
      );
    }
    if (aapDecision === "UNFAVORABLE") {
      return (
        <CustomErrorBadge label="Non favorable" dataTest="unfavorable-badge" />
      );
    }

    return <BadgeToComplete />;
  };

  return (
    <EnhancedSectionCard
      title="Avis sur la faisabilité"
      titleIconClass="fr-icon-thumb-up-fill"
      status={aapDecision ? "COMPLETED" : "TO_COMPLETE"}
      isEditable={isEditable && !disabled}
      disabled={disabled}
      buttonOnClickHref={`/candidacies/${candidacyId}/feasibility-aap/decision`}
      CustomBadge={<DecisionBadge />}
      data-testid="decision-section"
    >
      {aapDecisionComment && <p className="md:pl-10">“{aapDecisionComment}”</p>}
      {disabled && (
        <SmallNotice>
          Une recevabilité en cours favorable existe déjà sur cette candidature.
          Vous ne pouvez pas émettre un avis sur la faisabilité.
        </SmallNotice>
      )}
    </EnhancedSectionCard>
  );
};
