import { CustomErrorBadge } from "@/components/badge/custom-error-badge/CustomErrorBadge";
import {
  BadgeToComplete,
  DefaultCandidacySectionCard,
} from "@/components/card/candidacy-section-card/DefaultCandidacySectionCard";
import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { DfFileAapDecision } from "@/graphql/generated/graphql";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { useParams } from "next/navigation";

export const DecisionCard = ({
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
      isEditable={isEditable && !disabled}
      disabled={disabled}
      buttonOnClickHref={`/candidacies/${candidacyId}/feasibility-aap/decision`}
      CustomBadge={<DecisionBadge />}
    >
      {aapDecisionComment && <p className="md:pl-10">“{aapDecisionComment}”</p>}
      {disabled && (
        <SmallNotice>
          Une recevabilité en cours favorable existe déjà sur cette candidature.
          Vous ne pouvez pas émettre un avis sur la faisabilité.
        </SmallNotice>
      )}
    </DefaultCandidacySectionCard>
  );
};
