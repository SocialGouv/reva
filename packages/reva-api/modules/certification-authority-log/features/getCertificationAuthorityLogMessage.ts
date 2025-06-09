import { CertificationAuthorityLog } from "../certification-authority-log.types";

type LogMessage = {
  message: string;
  details?: string;
};

function log(message: string, details?: string): LogMessage {
  return { message, details };
}

export const getCertificationAuthorityLogMessage = ({
  certificationAuthorityLog,
}: {
  certificationAuthorityLog: CertificationAuthorityLog;
}): LogMessage => {
  const { eventType } = certificationAuthorityLog;

  switch (eventType) {
    default:
      return log("Événement inconnu");
  }
};
