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
  const { eventType } = aapLog;

  switch (eventType) {
    case "SUBCRIBTION_REQUEST_VALIDATED":
      return log("Demande de création de compte validée");

    case "MAISON_MERE_LEGAL_INFORMATION_UPDATED":
      return log("Informations générales de la maison mère mises à jour");
    default:
      return log("Événement inconnu");
  }
};
