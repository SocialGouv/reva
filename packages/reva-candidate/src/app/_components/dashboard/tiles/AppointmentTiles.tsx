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
    candidacy.activeDossierDeValidation?.decision !== "PENDING"
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
