import Tile from "@codegouvfr/react-dsfr/Tile";

import TileGroup from "@/components/tile-group/TileGroup";

type ContactInfosSectionProps = {
  certificationAuthority?: {
    label: string;
    contactFullName?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
  } | null;
  certificationAuthorityLocalAccounts?: Array<{
    contactFullName?: string | null;
    contactEmail?: string | null;
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
  const filteredAccounts = certificationAuthorityLocalAccounts?.filter(
    (account) =>
      account?.contactEmail !== null && account?.contactFullName !== null,
  );
  return (
    <TileGroup icon="fr-icon-team-line" title="Contacts">
      <div className="flex flex-row" data-testid="contact-infos-section">
        {organism && (
          <Tile
            className="basis-1/2 grow h-auto"
            classes={{
              content: "pb-0",
            }}
            orientation="horizontal"
            title="Architecte accompagnateur de parcours"
            small
            desc={
              <div data-testid="organism-contact-info-tile">
                <div>{organism?.nomPublic || organism?.label}</div>
                <div>{organism?.adresseNumeroEtNomDeRue}</div>
                <div>{organism?.adresseInformationsComplementaires}</div>
                <div>
                  {organism?.adresseCodePostal} {organism?.adresseVille}
                </div>
                <div>{organism?.telephone}</div>
                <div>{organism?.emailContact}</div>
              </div>
            }
          />
        )}
        {certificationAuthority && (
          <Tile
            className="basis-1/2 grow h-auto"
            title="Certificateur"
            small
            orientation="horizontal"
            desc={
              <div data-testid="certification-authority-contact-info-tile">
                {certificationAuthority?.label}
                {filteredAccounts && filteredAccounts.length > 0 ? (
                  filteredAccounts.map((account, i) => (
                    <div
                      key={i}
                      className="[&:not(:last-child)]:border-b-2 [&:not(:last-child)]:mb-4 [&:not(:last-child)]:pb-4"
                      data-testid={`certification-authority-local-account-${i}`}
                    >
                      {account?.contactFullName} <br />
                      {account?.contactEmail} <br />
                      {account?.contactPhone}
                    </div>
                  ))
                ) : (
                  <div data-testid="certification-authority-contact-info-tile">
                    <div>{certificationAuthority?.contactFullName}</div>
                    <div>{certificationAuthority?.contactEmail}</div>
                    <div>{certificationAuthority?.contactPhone}</div>
                  </div>
                )}
              </div>
            }
          />
        )}
      </div>
    </TileGroup>
  );
};
