import Tile from "@codegouvfr/react-dsfr/Tile";

import { IncompleteBadge } from "./IncompleteBadge";

export const CertificationTile = ({
  selectedCertificationId,
  readOnly,
}: {
  selectedCertificationId?: string | null;
  readOnly?: boolean;
}) => {
  const hasCertification = !!selectedCertificationId;
  const href = hasCertification
    ? `./certification/${selectedCertificationId}`
    : "./search-certification";

  const getDesc = () => {
    if (!hasCertification) return undefined;
    return readOnly ? "Consulter" : "Modifier";
  };

  const commonProps = {
    "data-testid": "certification-tile",
    start: hasCertification ? undefined : <IncompleteBadge />,
    desc: getDesc(),
    title: "Diplôme visé",
    small: true as const,
    imageUrl: "/candidat/images/pictograms/search.svg",
  };

  return <Tile {...commonProps} linkProps={{ href }} />;
};
