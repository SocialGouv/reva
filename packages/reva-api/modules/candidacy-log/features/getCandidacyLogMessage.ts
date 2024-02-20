import { CandidacyEventType } from "../candidacy-log.types";

export const getCandidacyLogMessage = ({
  eventType,
}: {
  eventType: CandidacyEventType;
}) => {
  switch (eventType) {
    case "DOSSIER_DE_VALIDATION_SENT":
      return "Dossier de validation envoyé";
    case "DOSSIER_DE_VALIDATION_PROBLEM_SIGNALED":
      return "Dossier de validation signalé";
    default:
      return eventType;
  }
};
