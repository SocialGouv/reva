import { DefaultCandidacySectionCard } from "@/components/card/candidacy-section-card/DefaultCandidacySectionCard";
import { useParams } from "next/navigation";
import { useDecisionCard } from "./decisionCard.hook";

export const DecisionCard = () => {
  const { candidacyId } = useParams();
  const { decision, decisionComment } = useDecisionCard();

  return (
    <DefaultCandidacySectionCard
      title="Avis sur la faisabilité"
      titleIconClass="fr-icon-thumb-up-fill"
      status={decision ? "COMPLETED" : "TO_COMPLETE"}
      isEditable
      buttonOnClickHref={`/candidacies/${candidacyId}/feasibility-aap/decision`}
    >
      {decisionComment && <p className="md:pl-10">“{decisionComment}”</p>}
    </DefaultCandidacySectionCard>
  );
};
