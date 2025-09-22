import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { toDate } from "date-fns";

import { FeasibilityDecisionHistory } from "@/components/feasibility-decison-history/FeasibilityDecisionHistory.component";

import {
  FeasibilityDecision,
  FeasibilityHistory,
} from "@/graphql/generated/graphql";

interface Props {
  decision: FeasibilityDecision;
  decisionComment?: string | null;
  decisionSentAt?: number | null;
  feasibilityHistory?: FeasibilityHistory[];
  candidacyId: string;
  onRevokeDecision?: () => void;
  isAdmin?: boolean;
  candidacyStatus: string;
}

export function FeasibilityBanner({
  decision,
  decisionComment,
  decisionSentAt,
  feasibilityHistory = [],
  onRevokeDecision,
  isAdmin = false,
  candidacyStatus,
}: Props) {
  const canRevokeDecision =
    isAdmin &&
    [
      "DOSSIER_FAISABILITE_RECEVABLE",
      "DOSSIER_FAISABILITE_NON_RECEVABLE",
    ].includes(candidacyStatus);
  switch (true) {
    case decision === "REJECTED":
      return (
        <>
          <div>
            <Alert
              className="mb-4"
              severity="error"
              data-test="feasibility-decision-rejected"
              title={`Dossier déclaré comme "non recevable" le ${toDate(decisionSentAt!).toLocaleDateString("fr-FR")}`}
              description={
                <p>
                  Si vous avez précisé les motifs de cette décision, ils seront
                  transmis au candidat : {'"'}
                  {decisionComment}
                  {'"'}
                </p>
              }
            />
            {canRevokeDecision && (
              <div className="flex justify-end mb-4">
                <Button priority="secondary" onClick={onRevokeDecision}>
                  Annuler la décision
                </Button>
              </div>
            )}
          </div>

          {feasibilityHistory.length > 0 && (
            <FeasibilityDecisionHistory history={feasibilityHistory} />
          )}
        </>
      );

    case decision === "INCOMPLETE":
      return (
        <>
          <Alert
            className="mb-12"
            severity="warning"
            data-test="feasibility-decision-incomplete"
            title={`Dossier renvoyé car "incomplet" le ${toDate(decisionSentAt!).toLocaleDateString("fr-FR")}`}
            description={
              <p>
                Le dossier a été renvoyé au candidat car "incomplet". Si vous
                avez précisé les motifs de cette décision, ils seront transmis
                au candidat : {'"'}
                {decisionComment}
                {'"'}
              </p>
            }
          />
          {feasibilityHistory.length > 0 && (
            <FeasibilityDecisionHistory history={feasibilityHistory} />
          )}
        </>
      );

    case decision === "PENDING":
      return feasibilityHistory.length > 0 ? (
        <FeasibilityDecisionHistory history={feasibilityHistory} />
      ) : null;

    case decision === "ADMISSIBLE":
      return (
        <>
          <div>
            <Alert
              className="mb-4"
              severity="success"
              data-test="feasibility-decision-admissible"
              small
              description={`Recevabilité acceptée le  ${toDate(decisionSentAt!).toLocaleDateString("fr-FR")}`}
            />
            {canRevokeDecision && (
              <div className="flex justify-end mb-4">
                <Button priority="secondary" onClick={onRevokeDecision}>
                  Annuler la décision
                </Button>
              </div>
            )}
          </div>
          {feasibilityHistory.length > 0 && (
            <FeasibilityDecisionHistory history={feasibilityHistory} />
          )}
        </>
      );

    default:
      return null;
  }
}
