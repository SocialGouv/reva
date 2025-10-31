import Tile from "@codegouvfr/react-dsfr/Tile";

export const NoContactTile = () => (
  <Tile
    data-testid="no-contact-tile"
    title="Aucun contact pour le moment"
    small
    orientation="horizontal"
    classes={{
      content: "pb-0",
    }}
  />
);
