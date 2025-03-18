import Badge from "@codegouvfr/react-dsfr/Badge";
import Tile from "@codegouvfr/react-dsfr/Tile";
import { format } from "date-fns";

export const RendezVousPedagogiqueTile = ({
  firstAppointmentOccuredAt,
}: {
  firstAppointmentOccuredAt: number;
}) => (
  <Tile
    small
    orientation="horizontal"
    classes={{
      content: "pb-0",
    }}
    start={
      <Badge severity="info" small>
        Rendez-vous pédagogique
      </Badge>
    }
    title={format(firstAppointmentOccuredAt, "dd/MM/yyyy")}
  />
);
