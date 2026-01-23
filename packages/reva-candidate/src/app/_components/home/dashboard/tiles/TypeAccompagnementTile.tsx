import Tile from "@codegouvfr/react-dsfr/Tile";

import { IncompleteBadge } from "./IncompleteBadge";

export const TypeAccompagnementTile = ({
  disabled,
  hasSelectedTypeAccompagnement,
}: {
  disabled?: boolean;
  hasSelectedTypeAccompagnement?: boolean;
}) => {
  const hasTypeAccompagnement = !!hasSelectedTypeAccompagnement;

  const getDesc = () => {
    if (!hasTypeAccompagnement) return undefined;
    return disabled ? "Consulter" : "Modifier";
  };

  const commonProps = {
    "data-testid": "type-accompagnement-tile",
    start: hasTypeAccompagnement ? undefined : <IncompleteBadge />,
    desc: getDesc(),
    title: "Modalité de parcours",
    small: true as const,
    imageUrl: "/candidat/images/pictograms/human-cooperation.svg",
    disabled,
  };

  if (disabled) {
    return <Tile {...commonProps} />;
  }

  return (
    <Tile
      {...commonProps}
      linkProps={{
        href: "./type-accompagnement",
      }}
    />
  );
};
