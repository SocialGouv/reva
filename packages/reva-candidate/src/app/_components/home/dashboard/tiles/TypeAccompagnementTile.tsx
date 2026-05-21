import { Tag } from "@codegouvfr/react-dsfr/Tag";
import Tile from "@codegouvfr/react-dsfr/Tile";
import { useRouter } from "next/navigation";

import { TypeAccompagnement } from "@/graphql/generated/graphql";

export const TypeAccompagnementTile = ({
  disabled = false,
  typeAccompagnement,
}: {
  disabled: boolean;
  typeAccompagnement: TypeAccompagnement;
}) => {
  const router = useRouter();
  const getDesc = () => {
    if (disabled) return undefined;
    return "Modifier";
  };
  const accompanimentBadge =
    typeAccompagnement === "AUTONOME" ? (
      <Tag small>Autonome</Tag>
    ) : (
      <Tag small>Accompagné</Tag>
    );

  const commonProps = {
    "data-testid": "type-accompagnement-tile",
    start: accompanimentBadge,
    desc: getDesc(),
    title: "Modalité de parcours",
    small: true as const,
    imageUrl: "/candidat/images/pictograms/human-cooperation.svg",
    imageSvg: true,
    className: "h-[200px]",
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
    />
  );
};
