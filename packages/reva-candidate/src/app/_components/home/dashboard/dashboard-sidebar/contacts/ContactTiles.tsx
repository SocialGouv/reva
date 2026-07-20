import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";

import { CandidacyUseCandidateForDashboard } from "../../dashboard.hooks";
import TileGroup from "../../tiles/TileGroup";

import { AapContactTile } from "./AapContactTile";
import { CertificationAuthorityContactTile } from "./CertificationAuthorityContactTile";
import { MultipleCertificationAuthorityAvailableContactTile } from "./MultipleCertificationAuthorityAvailableContactTile";
import { NoCertificationAuthorityContactTile } from "./NoCertificationAuthorityAvailableContactTile";
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

  const availableCertificationAuthorities = candidacy.certificationAuthorities;

  const noCertificationAuthorityAvailable =
    availableCertificationAuthorities.length === 0;

  const multipleCertificationAuthorityAvailable =
    availableCertificationAuthorities.length > 1;

  const certificationAuthority = isNewCertificationAuthorityCardFeatureActive
    ? candidacy.certificationAuthority
    : candidacy.feasibility?.certificationAuthority;

  //only show no certification authority contact tile if the feature is active and a certification is selected but no certification authority is set and none is available
  const showNoCertificationAuthorityContactTile =
    isNewCertificationAuthorityCardFeatureActive &&
    candidacy.certification &&
    !certificationAuthority &&
    noCertificationAuthorityAvailable;

  const showMultipleCertificationAuthorityAvailableContactTile =
    isNewCertificationAuthorityCardFeatureActive &&
    !certificationAuthority &&
    multipleCertificationAuthorityAvailable;

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
      {showMultipleCertificationAuthorityAvailableContactTile && (
        <MultipleCertificationAuthorityAvailableContactTile
          candidateId={candidacy.candidate.id}
          candidacyId={candidacy.id}
        />
      )}

      {showNoCertificationAuthorityContactTile && (
        <NoCertificationAuthorityContactTile />
      )}
    </TileGroup>
  );
};
