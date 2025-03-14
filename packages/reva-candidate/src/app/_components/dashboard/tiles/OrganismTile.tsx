import Tile from "@codegouvfr/react-dsfr/Tile";
import { CompleteIncompleteBadge } from "./CompleteIncompleteBadge";

export const OrganismTile = ({
  hasSelectedOrganism,
}: {
  hasSelectedOrganism: boolean;
}) => (
  <Tile
    start={<CompleteIncompleteBadge isComplete={hasSelectedOrganism} />}
    title="Accompagnateur"
    small
    linkProps={{
      href: "/set-organism",
    }}
    imageUrl="/candidat/images/pictograms/avatar.svg"
  />
);
