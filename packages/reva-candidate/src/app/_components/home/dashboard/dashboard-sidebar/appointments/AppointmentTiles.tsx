import Button from "@codegouvfr/react-dsfr/Button";
import { isAfter } from "date-fns";

import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";

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

  const isReadyForJury =
    candidacy.readyForJuryEstimatedAt &&
    (candidacy.activeDossierDeValidation?.decision !== "PENDING" ||
      canSubmitAgainAfterJury);

  const hasDateOfJurySession =
    candidacy.jury && isAfter(candidacy.jury.dateOfSession, new Date());

  const hasNoAppointment =
    candidacy.appointments?.rows?.length === 0 &&
    !isReadyForJury &&
    !hasDateOfJurySession;

  const { isFeatureActive } = useFeatureFlipping();

  const isAppointmentFeatureEnabled = isFeatureActive("APPOINTMENTS");

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

        {isReadyForJury && (
          <ReadyForJuryTile
            readyForJuryEstimatedAt={candidacy.readyForJuryEstimatedAt!}
          />
        )}

        {hasDateOfJurySession && <JurySessionTile jury={candidacy.jury} />}

        {hasNoAppointment && <NoRendezVousTile />}
      </TileGroup>
      {candidacy.firstAppointmentOccuredAt && isAppointmentFeatureEnabled && (
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
