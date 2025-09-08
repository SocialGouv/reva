import Tile from "@codegouvfr/react-dsfr/Tile";

type CertificationAuthorityContactProps = {
  certificationAuthority: {
    label: string;
    contactFullName?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
  };
  certificationAuthorityLocalAccounts?: Array<{
    contactFullName?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
  } | null> | null;
};

export const CertificationAuthorityContactTile = ({
  certificationAuthority,
  certificationAuthorityLocalAccounts,
}: CertificationAuthorityContactProps) => {
  const filteredAccounts = certificationAuthorityLocalAccounts?.filter(
    (account) =>
      account?.contactEmail !== null && account?.contactFullName !== null,
  );
  return (
    <Tile
      data-test="certification-authority-contact-tile"
      title="Mon certificateur"
      small
      orientation="horizontal"
      classes={{
        content: "pb-0",
        body: "w-full",
        desc: "w-full text-wrap",
      }}
      desc={
        <div data-test="certification-authority-contact-info-tile">
          {certificationAuthority?.label}
          {filteredAccounts && filteredAccounts.length > 0 ? (
            filteredAccounts.map((account, i) => (
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
            <div data-test="certification-authority-contact-info-tile">
              <div>{certificationAuthority?.contactFullName}</div>
              <div>{certificationAuthority?.contactEmail}</div>
              <div>{certificationAuthority?.contactPhone}</div>
            </div>
          )}
        </div>
      }
    />
  );
};
