import { FeasibilityDecisionHistory } from "@/components/feasibility-decison-history";
import {
  FeasibilityDecision,
  FeasibilityHistory,
} from "@/graphql/generated/graphql";
import { dateThresholdCandidacyIsCaduque } from "@/utils/dateThresholdCandidacyIsCaduque";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { format, toDate } from "date-fns";
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
  isCandidacyActualisationFeatureActive: boolean;
  pendingCaduciteContestationSentAt?: number | null;
  hasConfirmedCaduciteContestation: boolean;
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
          data-test="feasibility-caducite-contestation-confirmed"
          title={`Recevabilité caduque depuis le ${format(
            lastActivityDate,
            "dd/MM/yyyy",
          )}`}
          description="Le candidat n'a pas procédé à son actualisation (démarche à effectuer tous les 6 mois). Sa recevabilité est donc caduque."
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
            dateThresholdCandidacyIsCaduque(lastActivityDate),
            "dd/MM/yyyy",
          )}`}
          description="Le candidat n'a pas procédé à son actualisation (démarche à effectuer tous les 6 mois). Sa recevabilité est donc caduque. S'il le souhaite, il peut contester la caducité. Vous devrez alors réévaluer cette décision."
        />
      );
    case decision === "REJECTED":
      return (
        <>
          <Alert
            className="mb-12"
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
          <Alert
            className="mb-12"
            severity="success"
            data-test="feasibility-decision-admissible"
            small
            description={`Recevabilité acceptée le  ${toDate(decisionSentAt!).toLocaleDateString("fr-FR")}`}
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
