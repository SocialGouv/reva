import Tile from "@codegouvfr/react-dsfr/Tile";

import { OrganismUseCandidateForDashboard } from "../../dashboard.hooks";

export const AapContactTile = ({
  organism,
}: {
  organism: OrganismUseCandidateForDashboard;
}) => {
  if (!organism) {
    return null;
  }

  const organismName = organism.nomPublic || organism.label;
  const organismEmail =
    organism.emailContact || organism.contactAdministrativeEmail;
  const organismPhone =
    organism.telephone || organism.contactAdministrativePhone;

  return (
    <Tile
      data-test="aap-contact-tile"
      title="Mon accompagnateur"
      small
      orientation="horizontal"
      classes={{
        content: "pb-0",
        body: "w-full",
        desc: "w-full text-wrap",
      }}
      desc={
        <>
          <p className="mb-1 text-sm">{organismName}</p>
          {organism.adresseVille && (
            <p className="mb-0 leading-normal text-sm">
              {organism.adresseNumeroEtNomDeRue} <br />
              {organism.adresseInformationsComplementaires && (
                <>
                  {organism.adresseInformationsComplementaires}
                  <br />
                </>
              )}
              {organism.adresseCodePostal} {organism.adresseVille}
            </p>
          )}
          <p className="mb-0 w-full leading-normal text-sm">
            {organismEmail}
            <br />
            {organismPhone}
          </p>
        </>
      }
    />
  );
};
