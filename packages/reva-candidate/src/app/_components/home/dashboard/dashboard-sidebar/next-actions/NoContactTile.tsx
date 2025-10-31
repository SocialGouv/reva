import Tile from "@codegouvfr/react-dsfr/Tile";

export const NoActionTile = () => (
  <Tile
    data-testid="no-action-tile"
    title="Aucune action attendue de votre part."
    small
    orientation="horizontal"
    classes={{
      content: "pb-0",
    }}
  />
);
