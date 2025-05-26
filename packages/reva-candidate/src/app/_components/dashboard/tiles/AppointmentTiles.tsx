import { isAfter } from "date-fns";
import { CandidacyUseCandidateForDashboard } from "../dashboard.hooks";
import { JurySessionTile } from "./JurySessionTile";
import { NoRendezVousTile } from "./NoRendezVousTile";
import { ReadyForJuryTile } from "./ReadyForJuryTile";
import { RendezVousPedagogiqueTile } from "./RendezVousPedagogiqueTile";

export const AppointmentTiles = ({
  candidacy,
}: {
  candidacy: CandidacyUseCandidateForDashboard;
}) => {
  const appointments: JSX.Element[] = [];
  // When the candidacy has a failed jury result,
  // the user can submit another dossier de validation
  const failedJuryResults = [
    "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
    "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION",
    "PARTIAL_SUCCESS_PENDING_CONFIRMATION",
    "FAILURE",
    "CANDIDATE_EXCUSED",
    "CANDIDATE_ABSENT",
  ];

  const canSubmitAgainAfterJury = failedJuryResults.includes(
    candidacy.jury?.result || "",
  );
  if (
    candidacy.firstAppointmentOccuredAt &&
    isAfter(candidacy.firstAppointmentOccuredAt, new Date())
  ) {
    appointments.push(
      <RendezVousPedagogiqueTile
        firstAppointmentOccuredAt={candidacy.firstAppointmentOccuredAt}
      />,
    );
  }

  if (
    candidacy.readyForJuryEstimatedAt &&
    (candidacy.activeDossierDeValidation?.decision !== "PENDING" ||
      canSubmitAgainAfterJury)
  ) {
    appointments.push(
      <ReadyForJuryTile
        readyForJuryEstimatedAt={candidacy.readyForJuryEstimatedAt}
      />,
    );
  }

  if (candidacy.jury && isAfter(candidacy.jury.dateOfSession, new Date())) {
    appointments.push(<JurySessionTile jury={candidacy.jury} />);
  }

  if (appointments.length === 0) {
    appointments.push(<NoRendezVousTile />);
  }

  return appointments;
};
