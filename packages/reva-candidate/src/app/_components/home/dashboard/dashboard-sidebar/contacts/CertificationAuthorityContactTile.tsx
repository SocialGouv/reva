import Tile from "@codegouvfr/react-dsfr/Tile";

type CertificationAuthorityContactProps = {
  certificationAuthority: {
    label: string;
    contactFullName?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
  };
};

export const CertificationAuthorityContactTile = ({
  certificationAuthority,
}: CertificationAuthorityContactProps) => {
  return (
    <Tile
      data-testid="certification-authority-contact-tile"
      title="Mon certificateur"
      small
      orientation="horizontal"
      classes={{
        content: "pb-0",
        body: "w-full",
        desc: "w-full text-wrap",
      }}
      desc={
        <div data-testid="certification-authority-contact-info-tile">
          {certificationAuthority?.label}
        </div>
      }
    />
  );
};
