import Badge from "@codegouvfr/react-dsfr/Badge";
import Tile from "@codegouvfr/react-dsfr/Tile";
import { format } from "date-fns";

export const ReadyForJuryTile = ({
  readyForJuryEstimatedAt,
}: {
  readyForJuryEstimatedAt: number;
}) => (
  <Tile
    data-test="ready-for-jury-tile"
    small
    orientation="horizontal"
    start={
      <Badge severity="info" small>
        Date prévisionnelle du dépot de dossier
      </Badge>
    }
    title={format(readyForJuryEstimatedAt, "dd/MM/yyyy")}
    detail="Cette date n’est pas engageante. Vous pouvez la modifier quand vous le souhaitez."
    linkProps={{
      href: "/dossier-de-validation",
    }}
  />
);
