import Badge from "@codegouvfr/react-dsfr/Badge";
import Tile from "@codegouvfr/react-dsfr/Tile";

import { formatIso8601Date } from "@/utils/formatIso8601Date";

export const ReadyForJuryTile = ({
  readyForJuryEstimatedAt,
}: {
  readyForJuryEstimatedAt: string;
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
    title={formatIso8601Date(readyForJuryEstimatedAt)}
    detail="Cette date n’est pas engageante. Vous pouvez la modifier quand vous le souhaitez."
    linkProps={{
      href: "./dossier-de-validation",
    }}
  />
);
