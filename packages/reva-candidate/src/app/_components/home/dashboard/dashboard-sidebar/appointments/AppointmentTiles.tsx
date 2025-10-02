import Button from "@codegouvfr/react-dsfr/Button";
import { isAfter } from "date-fns";

import { CandidacyUseCandidateForDashboard } from "../../dashboard.hooks";
import TileGroup from "../../tiles/TileGroup";

import { GenericAppointmentTile } from "./GenericAppointmentTile";
import { JurySessionTile } from "./JurySessionTile";
import { NoRendezVousTile } from "./NoRendezVousTile";
import { ReadyForJuryTile } from "./ReadyForJuryTile";

export const AppointmentTiles = ({
  candidacy,
}: {
  candidacy: CandidacyUseCandidateForDashboard;
}) => {
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

  const hasFirstAppointment =
    candidacy.firstAppointmentOccuredAt &&
    isAfter(candidacy.firstAppointmentOccuredAt, new Date());

  const isReadyForJury =
    candidacy.readyForJuryEstimatedAt &&
    (candidacy.activeDossierDeValidation?.decision !== "PENDING" ||
      canSubmitAgainAfterJury);

  const hasDateOfJurySession =
    candidacy.jury && isAfter(candidacy.jury.dateOfSession, new Date());

  const hasNoAppointment =
    !hasFirstAppointment && !isReadyForJury && !hasDateOfJurySession;

  return (
    <div>
      <TileGroup
        icon="fr-icon-calendar-2-line"
        title="Mes prochains rendez-vous"
      >
        {candidacy.appointments.rows.map((appointment) => (
          <GenericAppointmentTile
            key={appointment.id}
            date={appointment.date}
            time={appointment.time}
            type={appointment.type}
          />
        ))}

        {isReadyForJury && (
          <ReadyForJuryTile
            readyForJuryEstimatedAt={candidacy.readyForJuryEstimatedAt!}
          />
        )}

        {hasDateOfJurySession && <JurySessionTile jury={candidacy.jury} />}

        {hasNoAppointment && <NoRendezVousTile />}
      </TileGroup>
      {candidacy.firstAppointmentOccuredAt && (
        <div className="flex justify-end mt-4">
          <Button
            priority="tertiary no outline"
            iconId="fr-icon-calendar-2-fill"
            className="mr-0"
          >
            Tous mes rendez-vous
          </Button>
        </div>
      )}
    </div>
  );
};
