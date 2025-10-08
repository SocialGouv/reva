import Tag from "@codegouvfr/react-dsfr/Tag";
import Tile from "@codegouvfr/react-dsfr/Tile";

import { TypeAccompagnement } from "@/graphql/generated/graphql";

export const TypeAccompagnementTile = ({
  typeAccompagnement,
  disabled,
}: {
  typeAccompagnement: TypeAccompagnement;
  disabled?: boolean;
}) => (
  <Tile
    data-test="type-accompagnement-tile"
    disabled={disabled}
    start={
      <Tag small>
        {typeAccompagnement === "ACCOMPAGNE" ? "Accompagné" : "Autonome"}
      </Tag>
    }
    title="Modalité de parcours"
    small
    linkProps={
      disabled
        ? undefined
        : ({
            href: "./type-accompagnement",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any)
    }
    imageUrl="/candidat/images/pictograms/human-cooperation.svg"
  />
);
