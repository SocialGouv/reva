import { FeasibilityDecision } from "@/graphql/generated/graphql";
import Alert, { AlertProps } from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
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
  onRevokeDecision,
  isAdmin = false,
  candidacyStatus,
}: {
  decisionSentAt: Date | null;
  decision: FeasibilityDecision;
  decisionComment?: string | null;
  history?: FeasibilityHistory[];
  onRevokeDecision?: () => void;
  isAdmin?: boolean;
  candidacyStatus?: string;
}) => {
  if (!decisionSentAt || decision === "COMPLETE") {
    return null;
  }

  const titleMap = {
    ADMISSIBLE: `Dossier recevable le ${format(decisionSentAt, "dd/MM/yyyy")}`,
    INCOMPLETE: `Dossier retourné incomplet le ${format(decisionSentAt, "dd/MM/yyyy")}`,
    REJECTED: `Dossier non recevable le ${format(decisionSentAt, "dd/MM/yyyy")}`,
  };

  const canDisplayHistory = !!history?.length && history.length > 1;
  const canRevoke =
    ["ADMISSIBLE", "REJECTED"].includes(decision) &&
    isAdmin &&
    candidacyStatus &&
    [
      "DOSSIER_FAISABILITE_RECEVABLE",
      "DOSSIER_FAISABILITE_NON_RECEVABLE",
    ].includes(candidacyStatus);

  return (
    <>
      <div>
        <Alert
          title={titleMap[decision as keyof typeof titleMap]}
          severity={
            severityMap[
              decision as keyof typeof severityMap
            ] as AlertProps.Severity
          }
          description={decisionComment ? `”${decisionComment}”` : ""}
          className="mb-4"
        />
        {canRevoke && (
          <div className="flex justify-end mb-4">
            <Button priority="secondary" onClick={onRevokeDecision}>
              Annuler la décision
            </Button>
          </div>
        )}
      </div>
      {canDisplayHistory && (
        <FeasibilityDecisionHistory
          className="mb-12"
          label="Décisions précédentes"
          decisions={history}
        />
      )}
    </>
  );
};
