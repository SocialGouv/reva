import Tile from "@codegouvfr/react-dsfr/Tile";

export const NoRendezVousTile = () => (
  <Tile
    data-testid="no-rendez-vous-tile"
    title="Aucun rendez-vous pour le moment"
    small
    orientation="horizontal"
    classes={{
      content: "pb-0",
    }}
  />
);
