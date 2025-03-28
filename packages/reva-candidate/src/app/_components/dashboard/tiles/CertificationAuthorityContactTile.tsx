import Tile from "@codegouvfr/react-dsfr/Tile";

export const CertificationAuthorityContactTile = ({
  certificationAuthorityLabel,
  certificationAuthorityContactFullName,
  certificationAuthorityContactEmail,
}: {
  certificationAuthorityLabel: string;
  certificationAuthorityContactFullName: string;
  certificationAuthorityContactEmail: string;
}) => (
  <Tile
    data-test="certification-authority-contact-tile"
    title="Mon certificateur"
    small
    orientation="horizontal"
    classes={{
      content: "pb-0",
    }}
    desc={
      <>
        <p className="mb-0 text-sm leading-normal">
          {certificationAuthorityLabel}
        </p>
        <p className="mb-0 text-sm leading-normal">
          {certificationAuthorityContactFullName}
        </p>
        <p className="mb-0 text-sm leading-normal">
          {certificationAuthorityContactEmail}
        </p>
      </>
    }
  />
);
