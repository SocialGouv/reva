import { useCandidacy } from "@/components/candidacy/candidacy.context";
import { TimeLineElementStatus } from "@/components/legacy/molecules/Timeline/Timeline";
import { TimelineNotice } from "@/components/timeline-notice/TimelineNotice";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { ReactNode } from "react";

interface GetSelfServiceFeasibilityFileTimelineInfo {
  status: TimeLineElementStatus;
  badge: JSX.Element | null;
  notice: ReactNode;
}

const ToCompleteBadge = (
  <Badge
    severity="warning"
    data-test="feasibility-timeline-element-complete-badge"
  >
    À compléter
  </Badge>
);

export function useGetSelfServiceFeasibilityFileTimelineInfo(): GetSelfServiceFeasibilityFileTimelineInfo {
  const { candidacy, feasibility } = useCandidacy();

  const ADMISSIBLE = feasibility?.decision === "ADMISSIBLE";
  const PENDING = feasibility?.decision === "PENDING";
  const INCOMPLETE = feasibility?.decision === "INCOMPLETE";
  const REJECTED = feasibility?.decision === "REJECTED";

  if (
    candidacy.status === "PROJET" &&
    !feasibility &&
    candidacy.certification
  ) {
    return {
      status: "editable",
      badge: ToCompleteBadge,
      notice: null,
    };
  }

  if (PENDING) {
    return {
      status: "readonly",
      badge: (
        <Badge
          severity="info"
          data-test="feasibility-timeline-element-pending-badge"
        >
          Envoyé
        </Badge>
      ),
      notice: (
        <TimelineNotice
          icon="fr-icon-time-fill"
          text="Votre dossier est étudié par votre certificateur. En cas d'erreur ou d'oubli, contactez-le pour pouvoir le modifier dans les plus brefs délais. Vous recevrez une réponse dans un délai de 2 mois. S'il est considéré comme incomplet, vous devrez le modifier et le renvoyer."
        />
      ),
    };
  }

  if (INCOMPLETE) {
    return {
      status: "editable",
      badge: ToCompleteBadge,
      notice: (
        <TimelineNotice
          icon="fr-icon-info-fill"
          text="Selon le certificateur, votre dossier est incomplet. Cliquez sur « Compléter » pour consulter ses remarques et rajouter le ou les éléments manquants avant de renvoyer votre dossier de faisabilité."
        />
      ),
    };
  }

  if (ADMISSIBLE) {
    return {
      status: "readonly",
      badge: (
        <Badge
          severity="success"
          data-test="feasibility-timeline-element-admissible-badge"
        >
          Recevable
        </Badge>
      ),
      notice: (
        <TimelineNotice
          icon="fr-icon-info-fill"
          text="Félicitations, votre dossier est recevable ! Vous pouvez poursuivre votre parcours VAE."
        />
      ),
    };
  }

  if (REJECTED) {
    return {
      status: "readonly",
      badge: (
        <Badge
          severity="error"
          data-test="feasibility-timeline-element-rejected-badge"
        >
          Non-recevable
        </Badge>
      ),
      notice: (
        <TimelineNotice
          icon="fr-icon-info-fill"
          text="Votre certificateur a estimé que votre dossier n'est pas recevable pour la suite de votre VAE."
        />
      ),
    };
  }

  return {
    status: "readonly",
    badge: null,
    notice: null,
  };
}
