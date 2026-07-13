import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";

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
  const endAccompagnementConfirmed =
    candidacy.endAccompagnementStatus === "CONFIRMED_BY_CANDIDATE" ||
    candidacy.endAccompagnementStatus === "CONFIRMED_BY_ADMIN";
  const endAccompagnementDate = candidacy.endAccompagnementDate;

  const { isFeatureActive } = useFeatureFlipping();

  const isNewCertificationAuthorityCardFeatureActive = isFeatureActive(
    "NEW_CANDIDACY_CERTIFICATION_AUTHORITY_CARD",
  );

  const certificationAuthority = isNewCertificationAuthorityCardFeatureActive
    ? candidacy.certificationAuthority
    : candidacy.feasibility?.certificationAuthority;

  return (
    <TileGroup icon="fr-icon-team-line" title="Mes contacts">
      {!candidacy.organism && !certificationAuthority && <NoContactTile />}
      {candidacy.organism && (
        <AapContactTile
          organism={candidacy.organism}
          endAccompagnementConfirmed={endAccompagnementConfirmed}
          endAccompagnementDate={endAccompagnementDate}
        />
      )}

      {certificationAuthority && (
        <CertificationAuthorityContactTile
          certificationAuthority={certificationAuthority}
        />
      )}
    </TileGroup>
  );
};
