import { useCandidacy } from "@/components/candidacy/candidacy.context";
import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import { TimeLineElementStatus } from "@/components/legacy/molecules/Timeline/Timeline";
import { TimelineNotice } from "@/components/timeline-notice/TimelineNotice";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface GetSelfServiceFeasibilityFileTimelineInfo {
  status: TimeLineElementStatus;
  badge: JSX.Element | null;
  notice: ReactNode;
  button: ReactNode;
}

const NonRecevableBadge = (
  <Badge
    severity="warning"
    data-test="feasibility-timeline-element-non-recevable-badge"
  >
    Non recevable
  </Badge>
);

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
  const { isFeatureActive } = useFeatureFlipping();
  const candidacyActualisationFeatureIsActive = isFeatureActive(
    "candidacy_actualisation",
  );
  const router = useRouter();

  const ADMISSIBLE = feasibility?.decision === "ADMISSIBLE";
  const PENDING = feasibility?.decision === "PENDING";
  const INCOMPLETE = feasibility?.decision === "INCOMPLETE";
  const REJECTED = feasibility?.decision === "REJECTED";
  const hasCertification = !!candidacy.certification;
  const isCaduque = candidacy.isCaduque;

  const pendingContestationCaducite =
    candidacy.candidacyContestationsCaducite?.find(
      (c) =>
        c?.certificationAuthorityContestationDecision === "DECISION_PENDING",
    );

  const hasConfirmedCaducite = candidacy.candidacyContestationsCaducite?.some(
    (contestation) =>
      contestation?.certificationAuthorityContestationDecision ===
      "CADUCITE_CONFIRMED",
  );

  const ReviewButton = (
    <Button
      data-test="feasibility-timeline-element-review-button"
      priority="secondary"
      onClick={() => {
        router.push("/feasibility");
      }}
    >
      Consulter
    </Button>
  );

  const CompleteButton = (
    <Button
      data-test="feasibility-timeline-element-update-button"
      priority="primary"
      onClick={() => {
        router.push("/feasibility");
      }}
    >
      Compléter
    </Button>
  );

  switch (true) {
    case hasConfirmedCaducite:
      return {
        status: "active",
        badge: NonRecevableBadge,
        notice: (
          <TimelineNotice
            icon="fr-icon-info-fill"
            text="Après étude de votre contestation, le certificateur a décidé que votre recevabilité n'était plus valable. Cela signifie que votre parcours VAE s'arrête ici."
          />
        ),
        button: ReviewButton,
      };

    case !!pendingContestationCaducite:
      return {
        status: "active",
        badge: NonRecevableBadge,
        notice: (
          <TimelineNotice
            icon="fr-icon-time-fill"
            text={`Votre contestation a été faite le ${format(
              pendingContestationCaducite.contestationSentAt,
              "dd/MM/yyyy",
            )}. Elle a été envoyée à votre certificateur qui y répondra dans les meilleurs délais.`}
          />
        ),
        button: ReviewButton,
      };

    case isCaduque && candidacyActualisationFeatureIsActive:
      return {
        status: "active",
        badge: NonRecevableBadge,
        notice: (
          <TimelineNotice
            icon="fr-icon-info-fill"
            text="Parce que vous ne vous êtes pas actualisé à temps, votre recevabilité est désormais caduque. Cela signifie que votre parcours VAE s'arrête ici. Vous pouvez contester cette décision en cliquant sur le bouton “Contester”."
          />
        ),
        button: ReviewButton,
      };

    case candidacy.status === "PROJET" && !feasibility && hasCertification:
      return {
        status: "editable",
        badge: ToCompleteBadge,
        notice: null,
        button: CompleteButton,
      };

    case PENDING:
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
        button: ReviewButton,
      };

    case INCOMPLETE:
      return {
        status: "editable",
        badge: ToCompleteBadge,
        notice: (
          <TimelineNotice
            icon="fr-icon-info-fill"
            text="Selon le certificateur, votre dossier est incomplet. Cliquez sur « Compléter » pour consulter ses remarques et rajouter le ou les éléments manquants avant de renvoyer votre dossier de faisabilité."
          />
        ),
        button: CompleteButton,
      };

    case ADMISSIBLE:
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
        button: ReviewButton,
      };

    case REJECTED:
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
        button: ReviewButton,
      };

    default:
      return {
        status: "readonly",
        badge: null,
        notice: null,
        button: null,
      };
  }
}
