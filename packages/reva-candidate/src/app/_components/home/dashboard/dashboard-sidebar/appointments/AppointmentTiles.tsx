import Button from "@codegouvfr/react-dsfr/Button";
import { isAfter } from "date-fns";

import { CandidacyUseCandidateForDashboard } from "../../dashboard.hooks";
import TileGroup from "../../tiles/TileGroup";

import { GenericAppointmentTile } from "./GenericAppointmentTile";
import { JurySessionTile } from "./JurySessionTile";
import { NoRendezVousTile } from "./NoRendezVousTile";

export const AppointmentTiles = ({
  candidacy,
}: {
  candidacy: CandidacyUseCandidateForDashboard;
}) => {
  const hasDateOfJurySession =
    candidacy.jury && isAfter(candidacy.jury.dateOfSession, new Date());

  const hasNoAppointment =
    candidacy.appointments?.rows?.length === 0 && !hasDateOfJurySession;

  return (
    <div>
      <TileGroup
        icon="fr-icon-calendar-2-line"
        title="Mes prochains rendez-vous"
      >
        {candidacy.appointments?.rows?.map((appointment) => (
          <GenericAppointmentTile
            id={appointment.id}
            key={appointment.id}
            date={appointment.date}
            type={appointment.type}
          />
        ))}

        {hasDateOfJurySession && <JurySessionTile jury={candidacy.jury} />}

        {hasNoAppointment && <NoRendezVousTile />}
      </TileGroup>
      {candidacy.firstAppointmentOccuredAt && (
        <div className="flex justify-end mt-4">
          <Button
            data-testid="all-appointments-button"
            priority="tertiary no outline"
            iconId="ri-calendar-todo-fill"
            className="mr-0"
            linkProps={{
              href: "./appointments",
            }}
          >
            Tous mes rendez-vous
          </Button>
        </div>
      )}
    </div>
  );
};
