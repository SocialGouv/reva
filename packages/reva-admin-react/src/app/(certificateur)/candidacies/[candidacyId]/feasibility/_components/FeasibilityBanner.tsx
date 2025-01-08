import { FeasibilityDecisionHistory } from "@/components/feasibility-decison-history";
import { CADUCITE_THRESHOLD_DAYS } from "@/constants/candidacy-caducite.constant";
import {
  FeasibilityDecision,
  FeasibilityHistory,
} from "@/graphql/generated/graphql";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { addDays, format } from "date-fns";
import Link from "next/link";

interface Props {
  decision: FeasibilityDecision;
  isCaduque: boolean;
  decisionComment?: string | null;
  decisionSentAt?: number | null;
  feasibilityHistory?: FeasibilityHistory[];
  lastActivityDate?: number | null;
  candidacyId: string;
  hasPendingCaduciteContestation: boolean;
  hasConfirmedCaduciteContestation: boolean;
  isCandidacyActualisationFeatureActive: boolean;
  pendingCaduciteContestationSentAt?: number | null;
}

export function FeasibilityBanner({
  decision,
  isCaduque,
  decisionComment,
  decisionSentAt,
  feasibilityHistory = [],
  lastActivityDate,
  candidacyId,
  hasPendingCaduciteContestation,
  isCandidacyActualisationFeatureActive,
  pendingCaduciteContestationSentAt,
  hasConfirmedCaduciteContestation,
}: Props) {
  switch (true) {
    case isCandidacyActualisationFeatureActive &&
      hasConfirmedCaduciteContestation &&
      !!lastActivityDate:
      return (
        <Alert
          className="mb-12"
          severity="error"
          data-test="feasibility-caduque"
          title={`Recevabilité caduque depuis le ${format(
            addDays(lastActivityDate, CADUCITE_THRESHOLD_DAYS),
            "dd/MM/yyyy",
          )}`}
          description="Le candidat n'est plus actif (<6 mois d'inactivité) et n'a pas procédé à son actualisation. Sa recevabilité est donc caduque."
        />
      );
    case isCandidacyActualisationFeatureActive &&
      hasPendingCaduciteContestation &&
      !!pendingCaduciteContestationSentAt:
      return (
        <div className="flex flex-col">
          <Alert
            className="mb-4"
            severity="warning"
            data-test="feasibility-caducite-contestation"
            title={`Contestation envoyée le ${format(
              pendingCaduciteContestationSentAt,
              "dd/MM/yyyy",
            )}`}
            description="Le candidat conteste la caducité de sa recevabilité. Consultez les raisons transmises par le candidat et décidez si, oui ou non, vous souhaitez restaurer la recevabilité."
          />
          <Link
            href={`/candidacies/${candidacyId}/feasibility/caducite-contestation`}
            className="self-end "
          >
            <Button>Consulter</Button>
          </Link>
        </div>
      );
    case isCandidacyActualisationFeatureActive &&
      isCaduque &&
      !!lastActivityDate:
      return (
        <Alert
          className="mb-12"
          severity="error"
          data-test="feasibility-caduque"
          title={`Recevabilité caduque depuis le ${format(
            addDays(lastActivityDate, CADUCITE_THRESHOLD_DAYS),
            "dd/MM/yyyy",
          )}`}
          description="Le candidat n'est plus actif (<6 mois d'inactivité) et n'a pas procédé à son actualisation. Sa recevabilité est donc caduque."
        />
      );
    case decision === "REJECTED":
      return (
        <>
          <Alert
            className="mb-12"
            severity="error"
            data-test="feasibility-decision-rejected"
            title={`Dossier déclaré comme "non recevable" le ${new Date(decisionSentAt!).toLocaleDateString("fr-FR")}`}
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
      );

    case decision === "INCOMPLETE":
      return (
        <>
          <Alert
            className="mb-12"
            severity="warning"
            data-test="feasibility-decision-incomplete"
            title={`Dossier renvoyé car "incomplet" le ${new Date(decisionSentAt!).toLocaleDateString("fr-FR")}`}
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
      );

    default:
      return null;
  }
}
