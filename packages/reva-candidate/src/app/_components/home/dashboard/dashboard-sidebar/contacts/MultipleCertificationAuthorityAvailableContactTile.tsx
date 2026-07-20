import Tile from "@codegouvfr/react-dsfr/Tile";

export const MultipleCertificationAuthorityAvailableContactTile = ({
  candidacyId,
  candidateId,
}: {
  candidacyId: string;
  candidateId: string;
}) => (
  <Tile
    data-testid="multiple-certification-authority-available-contact-tile"
    title="Mon certificateur"
    desc="Plusieurs certificateurs sont disponibles sur ce diplôme."
    small
    orientation="horizontal"
    detail="Choisir"
    linkProps={{
      href: `/candidates/${candidateId}/candidacies/${candidacyId}/multiple-certification-authorities-selection/disclaimer`,
    }}
  />
);
