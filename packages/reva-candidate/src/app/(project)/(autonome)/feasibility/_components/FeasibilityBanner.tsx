import { useCandidacy } from "@/components/candidacy/candidacy.context";
import { FeasibilityHistory } from "@/graphql/generated/graphql";
import CaduciteBanner from "./CaduciteBanner";
import FeasibilityDecisionDisplay from "./FeasibilityDecisionDisplay";

export function FeasibilityBanner() {
  const { candidacy } = useCandidacy();
  const isCaduque = candidacy.isCaduque;
  const feasibilityHistory: FeasibilityHistory[] =
    candidacy.feasibility?.history || [];

  if (isCaduque) {
    return <CaduciteBanner />;
  }

  if (candidacy.feasibility?.decision) {
    return (
      <FeasibilityDecisionDisplay
        decision={candidacy.feasibility.decision}
        feasibilityHistory={feasibilityHistory}
        decisionComment={candidacy.feasibility.decisionComment}
        decisionSentAt={candidacy.feasibility.decisionSentAt}
        decisionFile={candidacy.feasibility.decisionFile}
        feasibilityFileSentAt={candidacy.feasibility.feasibilityFileSentAt}
      />
    );
  }

  return null;
}
