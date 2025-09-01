import Badge from "@codegouvfr/react-dsfr/Badge";
import Tile from "@codegouvfr/react-dsfr/Tile";

import { formatIso8601Date } from "@/utils/formatIso8601Date";

export const RendezVousPedagogiqueTile = ({
  firstAppointmentOccuredAt,
}: {
  firstAppointmentOccuredAt: string;
}) => (
  <Tile
    data-test="rendez-vous-pedagogique-tile"
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
    title={formatIso8601Date(firstAppointmentOccuredAt)}
  />
);
