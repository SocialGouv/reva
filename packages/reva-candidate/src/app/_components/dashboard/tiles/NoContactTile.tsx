import Tile from "@codegouvfr/react-dsfr/Tile";

export const NoContactTile = () => (
  <Tile
    title="Aucun contact pour le moment"
    small
    orientation="horizontal"
    classes={{
      content: "pb-0",
    }}
  />
);
