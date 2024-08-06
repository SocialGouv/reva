import {
  FeasibilityDecision,
} from "@/graphql/generated/graphql";
import Alert, { AlertProps } from "@codegouvfr/react-dsfr/Alert";
import { format } from "date-fns";
import { FeasibilityDecisionHistory } from "../feasibility-decision-history/FeasibilityDecisionHistory";

type FeasibilityHistory = {
  id: string;
  decision: FeasibilityDecision;
  decisionSentAt?: number | null;
  decisionComment?: string | null;
};

const severityMap = {
  ADMISSIBLE: "success",
  INCOMPLETE: "info",
  REJECTED: "error",
};

export const DecisionSentComponent = ({
  decisionSentAt,
  decision,
  decisionComment,
  history,
}: {
  decisionSentAt: Date;
  decision: FeasibilityDecision;
  decisionComment?: string | null;
  history?: FeasibilityHistory[];
}) => {
  if (!decision) {
    return null;
  }

  const titleMap = {
    ADMISSIBLE: `Dossier recevable le ${format(decisionSentAt, "dd/MM/yyyy")}`,
    INCOMPLETE: `Dossier retourné incomplet le ${format(decisionSentAt, "dd/MM/yyyy")}`,
    REJECTED: `Dossier non recevable le ${format(decisionSentAt, "dd/MM/yyyy")}`,
  };

  return (
    <>
      <Alert
        title={titleMap[decision as keyof typeof titleMap]}
        severity={
          severityMap[
            decision as keyof typeof severityMap
          ] as AlertProps.Severity
        }
        description={decisionComment ? `”${decisionComment}”` : ""}
        className="mb-6"
      />
      {
        history && (
          <FeasibilityDecisionHistory
            className="mb-12"
            label="Décisions précédentes"
            decisions={history}
          />
        )
      }
    </>
  );
};
