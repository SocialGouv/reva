import Tile from "@codegouvfr/react-dsfr/Tile";

import { CompleteIncompleteBadge } from "./CompleteIncompleteBadge";

export const CertificationTile = ({
  selectedCertificationId,
}: {
  selectedCertificationId?: string | null;
}) => (
  <Tile
    data-testid="certification-tile"
    start={<CompleteIncompleteBadge isComplete={!!selectedCertificationId} />}
    title="Diplôme visé"
    small
    linkProps={{
      href: !!selectedCertificationId
        ? `./certification/${selectedCertificationId}`
        : "./search-certification",
    }}
    imageUrl="/candidat/images/pictograms/search.svg"
  />
);
