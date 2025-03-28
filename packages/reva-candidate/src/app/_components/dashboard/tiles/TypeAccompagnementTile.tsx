import { TypeAccompagnement } from "@/graphql/generated/graphql";
import Tag from "@codegouvfr/react-dsfr/Tag";
import Tile from "@codegouvfr/react-dsfr/Tile";

export const TypeAccompagnementTile = ({
  typeAccompagnement,
}: {
  typeAccompagnement: TypeAccompagnement;
}) => (
  <Tile
    data-test="type-accompagnement-tile"
    start={
      <Tag small>
        {typeAccompagnement === "ACCOMPAGNE" ? "Accompagné" : "Autonome"}
      </Tag>
    }
    title="Modalité de parcours"
    small
    linkProps={{
      href: "/type-accompagnement",
    }}
    imageUrl="/candidat/images/pictograms/human-cooperation.svg"
  />
);
