import { Card } from "@codegouvfr/react-dsfr/Card";
import { useMemo } from "react";

import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import { candidateCanSubmitCandidacyToAap } from "@/utils/candidateCanSubmitCandidacyToAap.util";

import { DashboardBanner } from "./banners/DashboardBanner";
import { DashboardSidebar } from "./dashboard-sidebar/DashboardSidebar";
import { useCandidacyForDashboard } from "./dashboard.hooks";
import { DashboardAccompagneTilesGroup } from "./persona-tiles-group/DashboardAccompagneTilesGroup";
import { DashboardAutonomeTilesGroup } from "./persona-tiles-group/DashboardAutonomeTilesGroup";
import { DashboardVaeCollectiveTilesGroup } from "./persona-tiles-group/DashboardVaeCollectiveTilesGroup";

const Dashboard = () => {
  const { candidacy, candidacyAlreadySubmitted } = useCandidacyForDashboard();
  const { isFeatureActive } = useFeatureFlipping();
  const isNextActionsFeatureActive = isFeatureActive("CANDIDATE_NEXT_ACTIONS");

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
      candidateCanSubmitCandidacyToAap({
        hasSelectedCertification,
        hasCompletedGoals,
        hasSelectedOrganism,
        hasCompletedExperience,
        candidacyAlreadySubmitted,
      }),
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
    <div className="flex flex-col-reverse lg:flex-row gap-8 mt-20">
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
      <DashboardSidebar
        candidacy={candidacy}
        className="basis-1/3"
        isNextActionsFeatureActive={isNextActionsFeatureActive}
      />
    </div>
  );

  const VaeCollectiveDashboard = () => (
    <div className="flex flex-col gap-8 mt-20">
      <Card
        size="small"
        classes={{ title: "text-xs text-dsfrGray-500", content: "pb-0" }}
        title={
          <span>
            <span className="fr-icon--sm fr-icon-building-fill mr-2" />
            {
              candidacy?.cohorteVaeCollective?.commanditaireVaeCollective
                ?.raisonSociale
            }
          </span>
        }
        desc={
          <div className="text-dsfrGray-titleGrey text-xl font-bold">
            {candidacy?.cohorteVaeCollective?.nom}
          </div>
        }
      />
      <div className="flex flex-col-reverse lg:flex-row gap-8">
        <DashboardVaeCollectiveTilesGroup
          className="basis-2/3"
          candidacy={candidacy}
          candidacyAlreadySubmitted={candidacyAlreadySubmitted}
          canSubmitCandidacy={canSubmitCandidacy}
          hasSelectedOrganism={hasSelectedOrganism}
          hasCompletedGoals={hasCompletedGoals}
        />
        <DashboardSidebar
          candidacy={candidacy}
          className="basis-1/3"
          isNextActionsFeatureActive={isNextActionsFeatureActive}
        />
      </div>
    </div>
  );

  return (
    <div>
      {candidacy.certification && (
        <p className="text-xl">
          RNCP {candidacy.certification.codeRncp} :{" "}
          {candidacy.certification.label}
        </p>
      )}
      <DashboardBanner
        candidacy={candidacy}
        canSubmitCandidacy={canSubmitCandidacy}
        candidacyAlreadySubmitted={candidacyAlreadySubmitted}
      />
      {candidacyIsVaeCollective ? (
        <VaeCollectiveDashboard />
      ) : (
        <NonVaeCollectiveDashboard />
      )}
    </div>
  );
};

export default Dashboard;
