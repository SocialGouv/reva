import Tile from "@codegouvfr/react-dsfr/Tile";
import { CompleteIncompleteBadge } from "./CompleteIncompleteBadge";

export const CertificationTile = ({
  hasSelectedCertification,
}: {
  hasSelectedCertification: boolean;
}) => (
  <Tile
    data-test="certification-tile"
    start={<CompleteIncompleteBadge isComplete={hasSelectedCertification} />}
    title="Diplôme visé"
    small
    linkProps={{
      href: hasSelectedCertification
        ? "/certification/"
        : "/search-certification",
    }}
    imageUrl="/candidat/images/pictograms/search.svg"
  />
);
