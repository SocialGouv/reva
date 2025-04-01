import { CandidacyUseCandidateForDashboard } from "./dashboard.hooks";
import { AapContactTile } from "./tiles/AapContactTile";
import { AppointmentTiles } from "./tiles/AppointmentTiles";
import { CertificationAuthorityContactTile } from "./tiles/CertificationAuthorityContactTile";
import { NoContactTile } from "./tiles/NoContactTile";
import TileGroup from "./tiles/TileGroup";

export const DashboardSidebar = ({
  candidacy,
}: {
  candidacy: CandidacyUseCandidateForDashboard;
}) => (
  <div className="flex flex-col col-span-1 row-span-2 row-start-1 gap-y-8">
    <TileGroup icon="fr-icon-calendar-2-line" title="Mes prochains rendez-vous">
      <AppointmentTiles candidacy={candidacy} />
    </TileGroup>
    <TileGroup icon="fr-icon-team-line" title="Mes contacts">
      {!candidacy.organism &&
        !candidacy.feasibility?.certificationAuthority && <NoContactTile />}
      {candidacy.organism && <AapContactTile organism={candidacy.organism} />}
      {candidacy.feasibility?.certificationAuthority && (
        <CertificationAuthorityContactTile
          certificationAuthorityLabel={
            candidacy.feasibility?.certificationAuthority.label
          }
          certificationAuthorityContactFullName={
            candidacy.feasibility?.certificationAuthority.contactFullName ?? ""
          }
          certificationAuthorityContactEmail={
            candidacy.feasibility?.certificationAuthority.contactEmail ?? ""
          }
        />
      )}
    </TileGroup>
  </div>
);
