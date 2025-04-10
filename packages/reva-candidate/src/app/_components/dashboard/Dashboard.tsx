import { candidateCanSubmitCandidacyToAap } from "@/utils/candidateCanSubmitCandidacyToAap.util";
import { useMemo } from "react";
import { DashboardBanner } from "./banners/DashboardBanner";
import { useCandidacyForDashboard } from "./dashboard.hooks";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardAccompagneTilesGroup } from "./persona-tiles-group/DashboardAccompagneTilesGroup";
import { DashboardAutonomeTilesGroup } from "./persona-tiles-group/DashboardAutonomeTilesGroup";
import { DashboardVaeCollectiveTilesGroup } from "./persona-tiles-group/DashboardVaeCollectiveTilesGroup";

const Dashboard = () => {
  const { candidacy, candidacyAlreadySubmitted } = useCandidacyForDashboard();

  const hasSelectedCertification = useMemo(
    () => candidacy?.certification?.id !== undefined,
    [candidacy],
  );

  const hasCompletedGoals = useMemo(
    () => candidacy?.goals?.length > 0,
    [candidacy],
  );

  const hasCompletedExperience = useMemo(
    () => candidacy?.experiences?.length > 0,
    [candidacy],
  );

  const hasSelectedOrganism = useMemo(
    () => candidacy?.organism?.id !== undefined,
    [candidacy],
  );

  const canSubmitCandidacy = useMemo(
    () =>
      candidateCanSubmitCandidacyToAap(
        hasSelectedCertification,
        hasCompletedGoals,
        hasSelectedOrganism,
        hasCompletedExperience,
        candidacyAlreadySubmitted,
      ),
    [
      hasSelectedCertification,
      hasCompletedGoals,
      hasSelectedOrganism,
      hasCompletedExperience,
      candidacyAlreadySubmitted,
    ],
  );

  const candidacyIsAutonome = candidacy?.typeAccompagnement === "AUTONOME";
  const candidacyIsAccompagne = candidacy?.typeAccompagnement === "ACCOMPAGNE";
  const candidacyIsVaeCollective = !!candidacy?.cohorteVaeCollective;

  const NonVaeCollectiveDashboard = () => (
    <>
      {candidacyIsAutonome && (
        <DashboardAutonomeTilesGroup
          className="basis-2/3"
          candidacy={candidacy}
        />
      )}
      {candidacyIsAccompagne && (
        <DashboardAccompagneTilesGroup
          className="basis-2/3"
          candidacy={candidacy}
          candidacyAlreadySubmitted={candidacyAlreadySubmitted}
          canSubmitCandidacy={canSubmitCandidacy}
          hasSelectedOrganism={hasSelectedOrganism}
          hasCompletedGoals={hasCompletedGoals}
        />
      )}
    </>
  );

  const VaeCollectiveDashboard = () => (
    <DashboardVaeCollectiveTilesGroup
      className="basis-2/3"
      candidacy={candidacy}
      candidacyAlreadySubmitted={candidacyAlreadySubmitted}
      canSubmitCandidacy={canSubmitCandidacy}
      hasSelectedOrganism={hasSelectedOrganism}
      hasCompletedGoals={hasCompletedGoals}
    />
  );

  return (
    <div>
      <p className="text-xl">
        RNCP {candidacy.certification?.codeRncp} :{" "}
        {candidacy.certification?.label}
      </p>
      <DashboardBanner
        candidacy={candidacy}
        canSubmitCandidacy={canSubmitCandidacy}
        candidacyAlreadySubmitted={candidacyAlreadySubmitted}
      />
      <div className="flex flex-col lg:flex-row gap-8 mt-20">
        {candidacyIsVaeCollective ? (
          <VaeCollectiveDashboard />
        ) : (
          <NonVaeCollectiveDashboard />
        )}
        <DashboardSidebar candidacy={candidacy} className="basis-1/3" />
      </div>
    </div>
  );
};

export default Dashboard;
