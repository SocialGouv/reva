import Badge from "@codegouvfr/react-dsfr/Badge";
import Tile from "@codegouvfr/react-dsfr/Tile";
import { isBefore, parseISO } from "date-fns";
import { useRouter } from "next/navigation";

import { CandidacyStatusStep } from "@/graphql/generated/graphql";

const TrainingStatusBadge = ({
  candidacyStatus,
  firstAppointmentOccuredAt,
}: {
  candidacyStatus: CandidacyStatusStep;
  firstAppointmentOccuredAt?: string | null;
}) => {
  if (
    (candidacyStatus == "VALIDATION" || candidacyStatus == "PRISE_EN_CHARGE") &&
    firstAppointmentOccuredAt &&
    isBefore(parseISO(firstAppointmentOccuredAt), new Date())
  ) {
    return (
      <Badge severity="info" data-testid="training-status-badge-in-progress">
        En cours
      </Badge>
    );
  } else if (candidacyStatus == "PARCOURS_ENVOYE") {
    return (
      <Badge severity="warning" data-testid="training-status-badge-to-validate">
        À valider
      </Badge>
    );
  } else if (
    candidacyStatus == "PARCOURS_CONFIRME" ||
    (candidacyStatus !== "VALIDATION" &&
      candidacyStatus !== "PRISE_EN_CHARGE" &&
      candidacyStatus !== "PROJET")
  ) {
    return (
      <Badge severity="success" data-testid="training-status-badge-validated">
        Validé
      </Badge>
    );
  }
};

export const TrainingTile = ({
  candidacyStatus,
  firstAppointmentOccuredAt,
}: {
  candidacyStatus: CandidacyStatusStep;
  firstAppointmentOccuredAt?: string | null;
}) => {
  const router = useRouter();

  const shouldDisableTile =
    candidacyStatus == "PROJET" ||
    candidacyStatus == "VALIDATION" ||
    candidacyStatus == "PRISE_EN_CHARGE";

  return (
    <Tile
      data-testid="training-tile"
      disabled={shouldDisableTile}
      title="Parcours et financement"
      start={
        <TrainingStatusBadge
          candidacyStatus={candidacyStatus}
          firstAppointmentOccuredAt={firstAppointmentOccuredAt}
        />
      }
      small
      buttonProps={{
        onClick: () => {
          router.push(
            candidacyStatus == "PRISE_EN_CHARGE" &&
              !!firstAppointmentOccuredAt &&
              isBefore(parseISO(firstAppointmentOccuredAt), new Date())
              ? "./waiting-for-training"
              : "./validate-training",
          );
        },
      }}
      imageUrl="/candidat/images/pictograms/in-progress.svg"
    />
  );
};
