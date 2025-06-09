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
  const { eventType, details } = certificationAuthorityLog;

  switch (eventType) {
    case "FEASIBILITY_MARKED_AS_COMPLETE":
      return log(
        `Le dossier de faisabilité de la candidature ${details.candidacyId} a été marqué comme complet`,
      );
    case "FEASIBILITY_MARKED_AS_INCOMPLETE":
      return log(
        `Le dossier de faisabilité de la candidature ${details.candidacyId} a été marqué comme incomplet`,
      );
    case "DOSSIER_DE_VALIDATION_PROBLEM_SIGNALED":
      return log(
        `Le dossier de validation de la candidature ${details.candidacyId} a été signalé`,
      );
    default:
      return log("Événement inconnu");
  }
};
