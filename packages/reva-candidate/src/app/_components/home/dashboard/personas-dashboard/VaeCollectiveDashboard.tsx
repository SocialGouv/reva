import Card from "@codegouvfr/react-dsfr/Card";

import { DashboardSidebar } from "../dashboard-sidebar/DashboardSidebar";
import { CandidacyUseCandidateForDashboard } from "../dashboard.hooks";
import { DashboardVaeCollectiveTilesGroup } from "../persona-tiles-group/DashboardVaeCollectiveTilesGroup";

export const VaeCollectiveDashboard = ({
  candidacy,
  candidacyAlreadySubmitted,
  canSubmitCandidacy,
  hasSelectedOrganism,
  hasCompletedGoals,
}: {
  candidacy: CandidacyUseCandidateForDashboard;
  candidacyAlreadySubmitted: boolean;
  canSubmitCandidacy: boolean;
  hasSelectedOrganism: boolean;
  hasCompletedGoals: boolean;
}) => {
  return (
    <div className="flex flex-col gap-8 mt-20">
      <Card
        size="small"
        classes={{ title: "text-xs text-dsfrGray-500", content: "pb-0" }}
        title={
          <span>
            <span className="fr-icon--sm fr-icon-building-fill mr-2" />
            {
              candidacy.cohorteVaeCollective?.commanditaireVaeCollective
                ?.raisonSociale
            }
          </span>
        }
        desc={
          <div className="text-dsfrGray-titleGrey text-xl font-bold">
            {candidacy.cohorteVaeCollective?.nom}
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
        <DashboardSidebar candidacy={candidacy} className="basis-1/3" />
      </div>
    </div>
  );
};
