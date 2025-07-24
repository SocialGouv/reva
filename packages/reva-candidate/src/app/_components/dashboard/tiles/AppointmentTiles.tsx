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
    <>
      {hasFirstAppointment && (
        <RendezVousPedagogiqueTile
          firstAppointmentOccuredAt={candidacy.firstAppointmentOccuredAt!}
        />
      )}

      {isReadyForJury && (
        <ReadyForJuryTile
          readyForJuryEstimatedAt={candidacy.readyForJuryEstimatedAt!}
        />
      )}

      {hasDateOfJurySession && <JurySessionTile jury={candidacy.jury} />}

      {hasNoAppointment && <NoRendezVousTile />}
    </>
  );
};
