import {
  TimelineElement,
  TimeLineElementStatus,
} from "@/components/legacy/molecules/Timeline/Timeline";

import { useCandidacy } from "@/components/candidacy/candidacy.context";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/navigation";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { TimelineNotice } from "@/components/timeline-notice/TimelineNotice";

export const SelfServiceFeasibilityFileTimelineElement = () => {
  const { candidacy } = useCandidacy();
  const router = useRouter();

  let status: TimeLineElementStatus = "disabled";

  const canComplete =
    (!candidacy.feasibility ||
      candidacy.feasibility.decision == "INCOMPLETE") &&
    candidacy.certification;

  if (canComplete) {
    status = "editable";
  }

  if (candidacy.status !== "PROJET" && !canComplete) {
    status = "readonly";
  }

  let badge = null;

  if (canComplete) {
    badge = (
      <Badge
        severity="warning"
        data-test="feasibility-timeline-element-complete-badge"
      >
        À compléter
      </Badge>
    );
  } else if (candidacy.feasibility?.decision === "PENDING") {
    badge = (
      <Badge
        severity="info"
        data-test="feasibility-timeline-element-pending-badge"
      >
        Envoyé
      </Badge>
    );
  } else if (candidacy.feasibility?.decision === "ADMISSIBLE") {
    badge = (
      <Badge
        severity="success"
        data-test="feasibility-timeline-element-admissible-badge"
      >
        Recevable
      </Badge>
    );
  } else if (candidacy.feasibility?.decision === "REJECTED") {
    badge = (
      <Badge
        severity="error"
        data-test="feasibility-timeline-element-rejected-badge"
      >
        Non-recevable
      </Badge>
    );
  }

  return (
    <TimelineElement
      title="Dossier de faisabilité"
      description="Un document important pour résumer vos expériences et tenter d’obtenir votre recevabilité !"
      status={status}
      badge={badge}
      data-test="feasibility-timeline-element"
    >
      {candidacy.feasibility?.decision === "PENDING" && (
        <TimelineNotice
          icon="fr-icon-time-fill"
          text="Votre dossier est étudié par votre certificateur. En cas d’erreur ou d’oubli, contactez-le pour pouvoir le modifier dans les plus brefs délais. Vous recevrez une réponse dans un délai de 2 mois. S’il est considéré comme incomplet, vous devrez le modifier et le renvoyer."
        />
      )}
      {candidacy.feasibility?.decision === "INCOMPLETE" && (
        <TimelineNotice
          icon="fr-icon-info-fill"
          text="Selon le certificateur, votre dossier est incomplet. Cliquez sur “Compléter” pour consulter ses remarques et rajouter le ou les éléments manquants avant de renvoyer votre dossier de faisabilité."
        />
      )}
      {candidacy.feasibility?.decision === "REJECTED" && (
        <TimelineNotice
          icon="fr-icon-info-fill"
          text="Votre certificateur a estimé que votre dossier n'est pas recevable pour la suite de votre VAE."
        />
      )}
      {candidacy.feasibility?.decision === "ADMISSIBLE" && (
        <TimelineNotice
          icon="fr-icon-info-fill"
          text="Félicitations, votre dossier est recevable ! Vous pouvez poursuivre votre parcours VAE."
        />
      )}
      {status !== "readonly" ? (
        <Button
          data-test="feasibility-timeline-element-update-button"
          priority="primary"
          onClick={() => {
            router.push("/feasibility");
          }}
          disabled={status === "disabled"}
        >
          Compléter
        </Button>
      ) : (
        <Button
          data-test="feasibility-timeline-element-review-button"
          priority="secondary"
          onClick={() => {
            router.push("/feasibility");
          }}
        >
          Consulter
        </Button>
      )}
    </TimelineElement>
  );
};
