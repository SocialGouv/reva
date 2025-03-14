import { CandidacyStatusStep } from "@/graphql/generated/graphql";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Tile from "@codegouvfr/react-dsfr/Tile";
import { isAfter, isBefore } from "date-fns";
import router from "next/router";

const TrainingStatusBadge = ({
  candidacyStatus,
  firstAppointmentOccuredAt,
}: {
  candidacyStatus: CandidacyStatusStep;
  firstAppointmentOccuredAt?: number | null;
}) => {
  if (
    (candidacyStatus == "VALIDATION" || candidacyStatus == "PRISE_EN_CHARGE") &&
    firstAppointmentOccuredAt &&
    isBefore(firstAppointmentOccuredAt, new Date())
  ) {
    return <Badge severity="info">En cours</Badge>;
  } else if (candidacyStatus == "PARCOURS_ENVOYE") {
    return <Badge severity="warning">À valider</Badge>;
  } else if (candidacyStatus == "PARCOURS_CONFIRME") {
    return <Badge severity="success">Validé</Badge>;
  }
};

export const TrainingTile = ({
  candidacyStatus,
  firstAppointmentOccuredAt,
}: {
  candidacyStatus: CandidacyStatusStep;
  firstAppointmentOccuredAt?: number | null;
}) => (
  <Tile
    disabled={
      candidacyStatus == "PROJET" ||
      candidacyStatus == "VALIDATION" ||
      (candidacyStatus == "PRISE_EN_CHARGE" &&
        !!firstAppointmentOccuredAt &&
        isAfter(firstAppointmentOccuredAt, new Date()))
    }
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
            isBefore(firstAppointmentOccuredAt, new Date())
            ? "/waiting-for-training"
            : "/validate-training",
        );
      },
    }}
    imageUrl="/candidat/images/pictograms/in-progress.svg"
  />
);
