import Tile from "@codegouvfr/react-dsfr/Tile";
import { CompleteIncompleteBadge } from "./CompleteIncompleteBadge";

export const CertificationTile = ({
  hasSelectedCertification,
  certificationId,
}: {
  hasSelectedCertification: boolean;
  certificationId?: string;
}) => (
  <Tile
    start={<CompleteIncompleteBadge isComplete={hasSelectedCertification} />}
    title="Diplôme visé"
    small
    linkProps={{
      href: hasSelectedCertification
        ? `/certification/${certificationId}`
        : "/search-certification",
    }}
    imageUrl="/candidat/images/pictograms/search.svg"
  />
);
