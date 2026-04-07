import { Tag } from "@codegouvfr/react-dsfr/Tag";
import Tile from "@codegouvfr/react-dsfr/Tile";
import { useRouter } from "next/navigation";

import { TypeAccompagnement } from "@/graphql/generated/graphql";

import { IncompleteBadge } from "./IncompleteBadge";

export const TypeAccompagnementTile = ({
  disabled = false,
  hasSelectedTypeAccompagnement,
  typeAccompagnement,
}: {
  disabled: boolean;
  hasSelectedTypeAccompagnement?: boolean;
  typeAccompagnement?: TypeAccompagnement;
}) => {
  const hasTypeAccompagnement = !!hasSelectedTypeAccompagnement;
  const router = useRouter();
  const getDesc = () => {
    if (!hasTypeAccompagnement || disabled) return undefined;
    return "Modifier";
  };
  const AccompagnementBadge = () => {
    if (!typeAccompagnement) return <IncompleteBadge />;
    if (typeAccompagnement === "AUTONOME") {
      return <Tag small>Autonome</Tag>;
    }
    return <Tag small>Accompagné</Tag>;
  };

  const commonProps = {
    "data-testid": "type-accompagnement-tile",
    start: <AccompagnementBadge />,
    desc: getDesc(),
    title: "Modalité de parcours",
    small: true as const,
    imageUrl: "/candidat/images/pictograms/human-cooperation.svg",
    imageSvg: true,
  };

  if (disabled) {
    return (
      <Tile
        {...commonProps}
        disabled
        buttonProps={{ onClick: () => router.push("./type-accompagnement") }}
      />
    );
  }

  return (
    <Tile
      {...commonProps}
      linkProps={{
        href: "./type-accompagnement",
      }}
      className="h-[200px]"
    />
  );
};
