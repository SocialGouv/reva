import { CandidacyUseCandidateForDashboard } from "../../dashboard.hooks";
import TileGroup from "../../tiles/TileGroup";

import { AapContactTile } from "./AapContactTile";
import { CertificationAuthorityContactTile } from "./CertificationAuthorityContactTile";
import { NoContactTile } from "./NoContactTile";

export const ContactTiles = ({
  candidacy,
}: {
  candidacy: CandidacyUseCandidateForDashboard;
}) => {
  return (
    <TileGroup icon="fr-icon-team-line" title="Mes contacts">
      {!candidacy.organism &&
        !candidacy.feasibility?.certificationAuthority && <NoContactTile />}
      {candidacy.organism && <AapContactTile organism={candidacy.organism} />}
      {candidacy.feasibility?.certificationAuthority && (
        <CertificationAuthorityContactTile
          certificationAuthority={candidacy.feasibility.certificationAuthority}
          certificationAuthorityLocalAccounts={
            candidacy.certificationAuthorityLocalAccounts
          }
        />
      )}
    </TileGroup>
  );
};
