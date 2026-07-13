import { Tile } from "@codegouvfr/react-dsfr/Tile";

export const NoCertificationAuthorityContactTile = () => (
  <Tile
    data-testid="no-certification-authority-contact-tile"
    title="Mon certificateur"
    small
    orientation="horizontal"
    classes={{
      content: "pb-0",
    }}
    desc={
      <span>
        Actuellement, aucun certificateur ne prend cette certification en
        charge. Pour que cette candidature puisse aboutir,{" "}
        <a href="https://vae.gouv.fr/nous-contacter/" target="_blank">
          contactez le support
        </a>{" "}
        et informez-les de la situation.
      </span>
    }
  />
);
