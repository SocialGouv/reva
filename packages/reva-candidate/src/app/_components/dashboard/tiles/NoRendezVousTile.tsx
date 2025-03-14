import Tile from "@codegouvfr/react-dsfr/Tile";

export const NoRendezVousTile = () => (
  <Tile
    title="Aucun rendez-vous pour le moment"
    small
    orientation="horizontal"
    classes={{
      content: "pb-0",
    }}
  />
);
