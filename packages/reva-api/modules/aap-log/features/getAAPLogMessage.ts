import { AAPLog } from "../aap-log.types";

type LogMessage = {
  message: string;
  details?: string;
};

function log(message: string, details?: string): LogMessage {
  return { message, details };
}

export const getAAPLogMessage = ({
  aapLog,
}: {
  aapLog: AAPLog;
}): LogMessage => {
  const { eventType, details } = aapLog;

  switch (eventType) {
    case "SUBCRIBTION_REQUEST_VALIDATED":
      return log("Demande de création de compte validée");

    case "MAISON_MERE_LEGAL_INFORMATION_UPDATED":
      return log("Informations générales de la maison mère mises à jour");

    case "MAISON_MERE_ORGANISMS_ISACTIVE_UPDATED":
      return log(
        "Statut de la maison mère mis à jour",
        `nouveau statut :  ${details.isActive ? "activé" : "désactivé"}`,
      );
    case "MAISON_MERE_SIGNALIZED_STATUS_UPDATED":
      return log(
        "Signalisation de la maison mère mis à jour",
        `nouveau statut :  ${details.isSignalized ? "signalée" : "non signalée"}`,
      );
    default:
      return log("Événement inconnu");
  }
};
