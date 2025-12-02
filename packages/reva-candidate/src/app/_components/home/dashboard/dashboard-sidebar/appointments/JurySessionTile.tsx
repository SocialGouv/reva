import Tag from "@codegouvfr/react-dsfr/Tag";
import Tile from "@codegouvfr/react-dsfr/Tile";
import { format } from "date-fns";

import { JuryUseCandidateForDashboard } from "../../dashboard.hooks";

export const JurySessionTile = ({
  jury,
}: {
  jury: JuryUseCandidateForDashboard;
}) => {
  if (!jury) {
    return null;
  }

  const dateOfJurySession = jury.timeSpecified
    ? format(jury.dateOfSession, "dd/MM/yyyy - HH:mm")
    : format(jury.dateOfSession, "dd/MM/yyyy");

  return (
    <Tile
      data-testid="jury-session-tile"
      small
      orientation="horizontal"
      classes={{
        content: "pb-0",
      }}
      start={<Tag small>Passage devant le jury</Tag>}
      title={dateOfJurySession}
      linkProps={{
        href: "./jury-session",
      }}
    />
  );
};
