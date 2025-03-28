import { useCandidacy } from "@/components/candidacy/candidacy.context";
import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import { TimeLineElementStatus } from "@/components/legacy/molecules/Timeline/Timeline";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { format } from "date-fns";

interface GetFeasibilityTimelineElementInfoResult {
  text: string;
  status: TimeLineElementStatus;
  icon: string;
  badge?: React.ReactNode;
}

const DEFAULT_TEXT =
  "Si le dossier de faisabilité est jugé recevable par le certificateur, alors vous pourrez démarrer l'étape du Dossier de validation, avec l'accompagnement et les éventuelles formations prévues au moment de la Définition du parcours pédagogique.";
const DF_HAS_BEEN_SENT_TEXT =
  "Votre dossier de faisabilité a été transmis au certificateur. Vous recevrez une réponse dans un délai de 2 mois maximum, par e-mail et dans certains cas en plus par courrier. Votre accompagnateur sera lui aussi informé de la décision du certificateur.";

const INFORMATION_ICON = "fr-icon-information-fill";
const TIME_ICON = "fr-icon-time-fill";

const BadgeNonValable = (
  <Badge
    severity="warning"
    data-test="feasibility-timeline-element-non-valable-badge"
  >
    Non valable
  </Badge>
);

export const useGetFeasibilityPdfTimelineElementInfo =
  (): GetFeasibilityTimelineElementInfoResult => {
    const { feasibility, candidacy } = useCandidacy();
    const { isFeatureActive } = useFeatureFlipping();
    const candidacyActualisationFeatureIsActive = isFeatureActive(
      "candidacy_actualisation",
    );

    const isCaduque = candidacy.isCaduque;

    if (!feasibility) {
      return {
        text: "",
        status: "disabled",
        icon: INFORMATION_ICON,
      };
    }

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

    const PENDING = feasibility.decision === "PENDING";
    const INCOMPLETE = feasibility.decision === "INCOMPLETE";
    const ADMISSIBLE = feasibility.decision === "ADMISSIBLE";
    const REJECTED = feasibility.decision === "REJECTED";
    const COMPLETE = feasibility.decision === "COMPLETE";

    switch (true) {
      case hasConfirmedCaducite:
        return {
          text: "Après étude de votre contestation, le certificateur a décidé que votre recevabilité n'était plus valable. Cela signifie que votre parcours VAE s'arrête ici.",
          status: "active",
          icon: INFORMATION_ICON,
          badge: BadgeNonValable,
        };

      case !!pendingContestationCaducite:
        return {
          text: `Votre contestation a été faite le ${format(
            pendingContestationCaducite.contestationSentAt,
            "dd/MM/yyyy",
          )}. Elle a été envoyée à votre certificateur qui y répondra dans les
          meilleurs délais.`,
          status: "active",
          icon: TIME_ICON,
          badge: BadgeNonValable,
        };

      case isCaduque && candidacyActualisationFeatureIsActive:
        return {
          text: "Parce que vous ne vous êtes pas actualisé à temps, votre recevabilité est désormais caduque. Cela signifie que votre parcours VAE s'arrête ici. Vous pouvez contester cette décision en cliquant sur le bouton “Contester”.",
          status: "active",
          icon: INFORMATION_ICON,
          badge: BadgeNonValable,
        };

      case PENDING:
        return {
          text: DF_HAS_BEEN_SENT_TEXT,
          status: "active",
          icon: TIME_ICON,
        };

      case INCOMPLETE:
        return {
          text: DF_HAS_BEEN_SENT_TEXT,
          status: "active",
          icon: TIME_ICON,
        };

      case ADMISSIBLE && !!feasibility.decisionSentAt:
        return {
          text: `Votre dossier de faisabilité a été jugé recevable par le certificateur le ${format(
            feasibility.decisionSentAt,
            "dd/MM/yyyy",
          )}. Votre accompagnateur va prendre contact avec vous prochainement pour démarrer votre accompagnement.`,
          status: "readonly",
          icon: INFORMATION_ICON,
        };

      case REJECTED:
        return {
          text: "Votre dossier de faisabilité n'a pas été accepté par le certificateur, cela met donc fin à votre parcours France VAE.",
          status: "readonly",
          icon: INFORMATION_ICON,
        };

      case COMPLETE:
        return {
          text: DEFAULT_TEXT,
          status: "active",
          icon: INFORMATION_ICON,
        };

      default:
        return {
          text: DEFAULT_TEXT,
          status: "disabled",
          icon: INFORMATION_ICON,
        };
    }
  };
