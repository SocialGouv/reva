import { FeasibilityDecisionHistory } from "@/components/feasibility-decison-history";
import {
  FeasibilityDecision,
  FeasibilityHistory,
} from "@/graphql/generated/graphql";
import Alert from "@codegouvfr/react-dsfr/Alert";

interface Props {
  decision: FeasibilityDecision;
  decisionComment?: string | null;
  decisionSentAt?: number | null;
  feasibilityHistory?: FeasibilityHistory[];
}

export default function FeasibilityDecisionDisplay({
  decision,
  decisionComment,
  decisionSentAt,
  feasibilityHistory = [],
}: Props) {
  return (
    <>
      {decision == "REJECTED" && (
        <>
          <Alert
            className="mb-12"
            severity="error"
            data-test="feasibility-decision-rejected"
            title={`Dossier déclaré comme “non recevable” le ${new Date(decisionSentAt!).toLocaleDateString("fr-FR")}`}
            description={
              <p>
                Si vous avez précisé les motifs de cette décision, ils seront
                transmis au candidat : {'"'}
                {decisionComment}
                {'"'}
              </p>
            }
          />

          {feasibilityHistory.length > 0 && (
            <FeasibilityDecisionHistory history={feasibilityHistory} />
          )}
        </>
      )}
      {decision == "INCOMPLETE" && (
        <>
          <Alert
            className="mb-12"
            severity="warning"
            data-test="feasibility-decision-incomplete"
            title={`Dossier renvoyé car “incomplet” le ${new Date(decisionSentAt!).toLocaleDateString("fr-FR")}`}
            description={
              <p>
                Le dossier a été renvoyé au candidat car “incomplet”. Si vous
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
      )}
      {decision == "PENDING" && feasibilityHistory.length > 0 && (
        <FeasibilityDecisionHistory history={feasibilityHistory} />
      )}
      {decision == "ADMISSIBLE" && (
        <>
          <Alert
            className="mb-12"
            severity="success"
            data-test="feasibility-decision-admissible"
            small
            description={`Recevabilité acceptée le  ${new Date(decisionSentAt!).toLocaleDateString("fr-FR")}`}
          />
          {feasibilityHistory.length > 0 && (
            <FeasibilityDecisionHistory history={feasibilityHistory} />
          )}
        </>
      )}
    </>
  );
}
