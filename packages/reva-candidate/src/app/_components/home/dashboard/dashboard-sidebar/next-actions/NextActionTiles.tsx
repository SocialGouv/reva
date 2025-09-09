import TileGroup from "../../tiles/TileGroup";

import { NoActionTile } from "./NoContactTile";

export const NextActionTiles = () => {
  return (
    <TileGroup
      icon="fr-icon-notification-3-line"
      title="Mes prochaines actions"
    >
      <NoActionTile />
    </TileGroup>
  );
};
