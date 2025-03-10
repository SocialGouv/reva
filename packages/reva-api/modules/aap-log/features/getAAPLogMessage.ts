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

    default:
      return log("Événement inconnu");
  }
};
