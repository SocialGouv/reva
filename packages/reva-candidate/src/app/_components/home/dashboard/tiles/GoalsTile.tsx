import Tile from "@codegouvfr/react-dsfr/Tile";

import { CompleteIncompleteBadge } from "./CompleteIncompleteBadge";

export const GoalsTile = ({
  hasCompletedGoals,
}: {
  hasCompletedGoals: boolean;
}) => (
  <Tile
    data-testid="goals-tile"
    start={<CompleteIncompleteBadge isComplete={hasCompletedGoals} />}
    title="Objectifs"
    small
    linkProps={{
      href: "./set-goals",
    }}
    imageUrl="/candidat/images/pictograms/conclusion.svg"
  />
);
