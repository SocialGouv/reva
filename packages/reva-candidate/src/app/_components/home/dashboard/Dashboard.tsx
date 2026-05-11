import { useMemo } from "react";

import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import { candidateCanSubmitCandidacyToAap } from "@/utils/candidateCanSubmitCandidacyToAap.util";

import { DashboardBanner } from "./banners/DashboardBanner";
import { useCandidacyForDashboard } from "./dashboard.hooks";
import { NonVaeCollectiveDashboard } from "./personas-dashboard/NonVaeCollectiveDashboard";
import { VaeCollectiveDashboard } from "./personas-dashboard/VaeCollectiveDashboard";

const Dashboard = () => {
  const { isFeatureActive } = useFeatureFlipping();
  const isCandidateDropOutV2Enabled = isFeatureActive("CANDIDATE_DROP_OUT_V2");

  const { candidacy, candidacyAlreadySubmitted, archiveCandidacy } =
    useCandidacyForDashboard();

  const hasSelectedCertification = useMemo(
    () => candidacy?.certification?.id !== undefined,
    [candidacy],
  );

  const hasCompletedGoals = useMemo(
    () => (candidacy?.goals && candidacy.goals.length > 0) || false,
    [candidacy],
  );

  const hasCompletedExperience = useMemo(
    () => (candidacy?.experiences && candidacy.experiences.length > 0) || false,
    [candidacy],
  );

  const hasSelectedOrganism = useMemo(
    () => candidacy?.organism?.id !== undefined,
    [candidacy],
  );

  const hasFeasibilitySent = useMemo(
    () => !!candidacy?.feasibility?.feasibilityFileSentAt,
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

  if (!candidacy) {
    return null;
  }

  const candidacyIsAutonome =
    candidacy.typeAccompagnement === "AUTONOME" ||
    !candidacy.typeAccompagnement;
  const candidacyIsAccompagne = candidacy.typeAccompagnement === "ACCOMPAGNE";
  const candidacyIsVaeCollective = !!candidacy.cohorteVaeCollective;

  const handleCandidacyDropOut = () => {
    archiveCandidacy.mutateAsync();
  };

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
        <VaeCollectiveDashboard
          candidacy={candidacy}
          candidacyAlreadySubmitted={candidacyAlreadySubmitted}
          canSubmitCandidacy={canSubmitCandidacy}
          hasSelectedOrganism={hasSelectedOrganism}
          hasCompletedGoals={hasCompletedGoals}
        />
      ) : (
        <NonVaeCollectiveDashboard
          candidacy={candidacy}
          candidacyAlreadySubmitted={candidacyAlreadySubmitted}
          canSubmitCandidacy={canSubmitCandidacy}
          hasSelectedOrganism={hasSelectedOrganism}
          hasCompletedGoals={hasCompletedGoals}
          candidacyIsAutonome={candidacyIsAutonome}
          candidacyIsAccompagne={candidacyIsAccompagne}
          isCandidateDropOutV2Enabled={isCandidateDropOutV2Enabled}
          handleCandidacyDropOut={handleCandidacyDropOut}
          hasFeasibilitySent={hasFeasibilitySent}
        />
      )}
    </div>
  );
};

export default Dashboard;
