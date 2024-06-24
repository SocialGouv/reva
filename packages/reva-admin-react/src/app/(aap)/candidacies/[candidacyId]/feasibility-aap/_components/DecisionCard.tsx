import { CustomErrorBadge } from "@/components/badge/custom-error-badge/CustomErrorBadge";
import {
  BadgeToComplete,
  DefaultCandidacySectionCard,
} from "@/components/card/candidacy-section-card/DefaultCandidacySectionCard";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { useParams } from "next/navigation";
import { useDecisionCard } from "./decisionCard.hook";

export const DecisionCard = () => {
  const { candidacyId } = useParams();
  const { decision, decisionComment } = useDecisionCard();

  const DecisionBadge = () => {
    if (decision === "FAVORABLE") {
      return (
        <Badge severity="success" noIcon>
          Favorable
        </Badge>
      );
    }
    if (decision === "UNFAVORABLE") {
      return <CustomErrorBadge label="Non favorable" />;
    }

    return <BadgeToComplete />;
  };

  return (
    <DefaultCandidacySectionCard
      title="Avis sur la faisabilité"
      titleIconClass="fr-icon-thumb-up-fill"
      status={decision ? "COMPLETED" : "TO_COMPLETE"}
      isEditable
      buttonOnClickHref={`/candidacies/${candidacyId}/feasibility-aap/decision`}
      CustomBadge={<DecisionBadge />}
    >
      {decisionComment && <p className="md:pl-10">“{decisionComment}”</p>}
    </DefaultCandidacySectionCard>
  );
};
