import Badge from "@codegouvfr/react-dsfr/Badge";
import Tile from "@codegouvfr/react-dsfr/Tile";

import { ExperiencesUseCandidateForDashboard } from "../dashboard.hooks";

export const ExperiencesTile = ({
  experiences,
}: {
  experiences: ExperiencesUseCandidateForDashboard;
}) => (
  <Tile
    data-test="experiences-tile"
    start={
      <>
        {experiences.length === 0 ? (
          <Badge severity="warning" data-test="incomplete-badge">
            À compléter
          </Badge>
        ) : (
          <Badge
            className="bg-[#fee7fc] text-[#6e445a]"
            data-test="complete-badge"
          >
            {experiences.length}{" "}
            {experiences.length === 1 ? "renseignée" : "renseignées"}
          </Badge>
        )}
      </>
    }
    title="Expériences"
    small
    linkProps={{
      href: "/experiences",
    }}
    imageUrl="/candidat/images/pictograms/culture.svg"
  />
);
