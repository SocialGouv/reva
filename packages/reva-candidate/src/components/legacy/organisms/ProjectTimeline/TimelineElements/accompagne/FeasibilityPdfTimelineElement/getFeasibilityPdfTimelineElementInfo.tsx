import { TimeLineElementStatus } from "@/components/legacy/molecules/Timeline/Timeline";
import { Feasibility } from "@/graphql/generated/graphql";
import { format } from "date-fns";

interface GetFeasibilityTimelineElementInfoProps {
  feasibility?: Feasibility | null;
  hasPendingOrConfirmedCaducity: boolean;
}

interface GetFeasibilityTimelineElementInfoResult {
  text: string;
  status: TimeLineElementStatus;
  icon: string;
}

const DEFAULT_TEXT =
  "Si le dossier de faisabilité est jugé recevable par le certificateur, alors vous pourrez démarrer l'étape du Dossier de validation, avec l'accompagnement et les éventuelles formations prévues au moment de la Définition du parcours pédagogique.";
const DF_HAS_BEEN_SENT_TEXT =
  "Votre dossier de faisabilité a été transmis au certificateur. Vous recevrez une réponse dans un délai de 2 mois maximum, par e-mail et dans certains cas en plus par courrier. Votre accompagnateur sera lui aussi informé de la décision du certificateur.";

const INFORMATION_ICON = "fr-icon-information-fill";
const TIME_ICON = "fr-icon-time-fill";

export const getFeasibilityPdfTimelineElementInfo = ({
  feasibility,
  hasPendingOrConfirmedCaducity,
}: GetFeasibilityTimelineElementInfoProps): GetFeasibilityTimelineElementInfoResult => {
  if (!feasibility) {
    return {
      text: "",
      status: "disabled",
      icon: INFORMATION_ICON,
    };
  }

  const PENDING = feasibility.decision === "PENDING";
  const INCOMPLETE = feasibility.decision === "INCOMPLETE";
  const ADMISSIBLE = feasibility.decision === "ADMISSIBLE";
  const REJECTED = feasibility.decision === "REJECTED";
  const COMPLETE = feasibility.decision === "COMPLETE";

  if (hasPendingOrConfirmedCaducity) {
    //TODO: déterminer si on veut la feature caducite sur df pdf
  }

  if (PENDING) {
    return {
      text: DF_HAS_BEEN_SENT_TEXT,
      status: "active",
      icon: TIME_ICON,
    };
  }

  if (INCOMPLETE) {
    return {
      text: DF_HAS_BEEN_SENT_TEXT,
      status: "active",
      icon: TIME_ICON,
    };
  }

  if (ADMISSIBLE && feasibility.decisionSentAt) {
    return {
      text: `Votre dossier de faisabilité a été jugé recevable par le certificateur le ${format(
        feasibility.decisionSentAt,
        "dd/MM/yyyy",
      )}. Votre accompagnateur va prendre contact avec vous prochainement pour démarrer votre accompagnement.`,
      status: "readonly",
      icon: INFORMATION_ICON,
    };
  }

  if (REJECTED) {
    return {
      text: "Votre dossier de faisabilité n'a pas été accepté par le certificateur, cela met donc fin à votre parcours France VAE.",
      status: "readonly",
      icon: INFORMATION_ICON,
    };
  }

  if (COMPLETE) {
    return {
      text: DEFAULT_TEXT,
      status: "active",
      icon: INFORMATION_ICON,
    };
  }

  return {
    text: DEFAULT_TEXT,
    status: "disabled",
    icon: INFORMATION_ICON,
  };
};
