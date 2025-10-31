import Tile from "@codegouvfr/react-dsfr/Tile";
import { format } from "date-fns";

import { OrganismUseCandidateForDashboard } from "../../dashboard.hooks";

export const AapContactTile = ({
  organism,
  endAccompagnementConfirmed,
  endAccompagnementDate,
}: {
  organism: OrganismUseCandidateForDashboard;
  endAccompagnementConfirmed: boolean;
  endAccompagnementDate?: number | null;
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
      data-testid="aap-contact-tile"
      title="Mon accompagnateur"
      small
      orientation="horizontal"
      classes={{
        content: "pb-0",
        body: "w-full",
        desc: "w-full text-wrap",
      }}
      desc={
        endAccompagnementConfirmed && endAccompagnementDate ? (
          <p className="mb-1 text-sm">
            L'accompagnement est terminé depuis le{" "}
            {format(endAccompagnementDate, "dd/MM/yyyy")}
          </p>
        ) : (
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
        )
      }
    />
  );
};
