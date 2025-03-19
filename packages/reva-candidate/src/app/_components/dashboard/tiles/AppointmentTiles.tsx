import { DossierDeValidationDecision } from "@/graphql/generated/graphql";
import { isAfter } from "date-fns";
import { NoRendezVousTile } from "./NoRendezVousTile";
import { ReadyForJuryTile } from "./ReadyForJuryTile";
import { RendezVousPedagogiqueTile } from "./RendezVousPedagogiqueTile";

export const AppointmentTiles = ({
  candidacy,
}: {
  candidacy: {
    firstAppointmentOccuredAt?: number | null;
    readyForJuryEstimatedAt?: number | null;
    activeDossierDeValidation?: {
      decision: DossierDeValidationDecision;
    } | null;
  };
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

  if (appointments.length === 0) {
    appointments.push(<NoRendezVousTile />);
  }

  return appointments;
};
