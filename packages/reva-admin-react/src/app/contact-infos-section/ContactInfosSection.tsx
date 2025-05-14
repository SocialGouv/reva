import TileGroup from "@/components/tile-group/TileGroup";
import Tile from "@codegouvfr/react-dsfr/Tile";

type ContactInfosSectionProps = {
  certificationAuthority: {
    label: string;
    contactFullName?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
  };
  certificationAuthorityLocalAccounts?: Array<{
    contactFullName: string;
    contactEmail: string;
    contactPhone?: string | null;
  } | null> | null;
  organism?: {
    contactAdministrativePhone?: string | null;
    contactAdministrativeEmail: string;
    adresseVille?: string | null;
    adresseCodePostal?: string | null;
    adresseInformationsComplementaires?: string | null;
    adresseNumeroEtNomDeRue?: string | null;
    emailContact?: string | null;
    telephone?: string | null;
    nomPublic?: string | null;
    label: string;
  } | null;
};

export const ContactInfosSection = ({
  certificationAuthority,
  organism,
  certificationAuthorityLocalAccounts,
}: ContactInfosSectionProps) => {
  return (
    <TileGroup icon="fr-icon-team-line" title="Contacts">
      <div className="flex flex-row">
        {organism && (
          <Tile
            className="basis-1/2 h-auto"
            classes={{
              content: "pb-0",
            }}
            orientation="horizontal"
            title="Architecte accompagnateur de parcours"
            small
            desc={
              <>
                <div>{organism?.nomPublic || organism?.label}</div>
                <div>{organism?.adresseNumeroEtNomDeRue}</div>
                <div>{organism?.adresseInformationsComplementaires}</div>
                <div>
                  {organism?.adresseCodePostal} {organism?.adresseVille}
                </div>
                <div>{organism?.telephone}</div>
                <div>{organism?.emailContact}</div>
              </>
            }
          />
        )}
        <Tile
          className="basis-1/2 h-auto"
          title="Certificateur"
          small
          orientation="horizontal"
          desc={
            <div>
              {certificationAuthority?.label}
              {certificationAuthorityLocalAccounts &&
              certificationAuthorityLocalAccounts.length > 0 ? (
                certificationAuthorityLocalAccounts.map((account, i) => (
                  <div
                    key={i}
                    className="[&:not(:last-child)]:border-b-2 [&:not(:last-child)]:mb-4 [&:not(:last-child)]:pb-4"
                    data-test={`certification-authority-local-account-${i}`}
                  >
                    {account?.contactFullName} <br />
                    {account?.contactEmail} <br />
                    {account?.contactPhone}
                  </div>
                ))
              ) : (
                <>
                  <div>{certificationAuthority?.contactFullName}</div>
                  <div>{certificationAuthority?.contactEmail}</div>
                  <div>{certificationAuthority?.contactPhone}</div>
                </>
              )}
            </div>
          }
        />
      </div>
    </TileGroup>
  );
};
