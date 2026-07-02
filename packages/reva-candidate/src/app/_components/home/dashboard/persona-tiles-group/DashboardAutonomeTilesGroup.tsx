import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";

import { CandidacyUseCandidateForDashboard } from "../dashboard.hooks";
import { CertificationTile } from "../tiles/CertificationTile";
import { DossierValidationTile } from "../tiles/DossierValidationTile";
import { ExperiencesTile } from "../tiles/ExperiencesTile";
import { FeasibilityTile } from "../tiles/FeasibilityTile";
import { FormationsTile } from "../tiles/FormationsTile";
import { GoalsTile } from "../tiles/GoalsTile";
import { TypeAccompagnementTile } from "../tiles/TypeAccompagnementTile";

import { DashboardTilesSection } from "./DashboardTilesSection";

export const DashboardAutonomeTilesGroup = ({
  candidacy,
  className,
  hasCompletedGoals,
}: {
  candidacy: CandidacyUseCandidateForDashboard;
  className?: string;
  hasCompletedGoals: boolean;
}) => {
  const feasibility = candidacy?.feasibility;
  const hasFeasibilitySent = !!candidacy?.feasibility?.feasibilityFileSentAt;

  const { isFeatureActive } = useFeatureFlipping();

  const isDfDematAutonomeEnabled = isFeatureActive("DF_DEMAT_AUTONOME");

  const readOnly =
    feasibility?.decision === "PENDING" ||
    feasibility?.decision === "ADMISSIBLE" ||
    feasibility?.decision === "COMPLETE" ||
    feasibility?.decision === "REJECTED";

  const hasCompletedFormations =
    !!candidacy.candidate.highestDegree &&
    !!candidacy.candidate.niveauDeFormationLePlusEleve;

  return (
    <div
      className={`flex flex-col gap-y-8 ${className || ""}`}
      data-testid="dashboard-autonome"
    >
      <DashboardTilesSection
        title="Compléter ma candidature"
        icon="fr-icon-ball-pen-line"
      >
        {isDfDematAutonomeEnabled ? (
          <>
            <div className="grid md:grid-cols-2 grid-rows-1">
              <CertificationTile
                selectedCertificationId={candidacy?.certification?.id}
                readOnly={hasFeasibilitySent}
              />
              <TypeAccompagnementTile
                typeAccompagnement={candidacy.typeAccompagnement}
                disabled={hasFeasibilitySent}
              />
            </div>
            <div className="grid md:grid-cols-3 grid-rows-1">
              <GoalsTile
                hasCompletedGoals={hasCompletedGoals}
                readOnly={readOnly}
              />
              <FormationsTile
                hasCompletedFormations={hasCompletedFormations}
                readOnly={readOnly}
              />
              <ExperiencesTile
                experiences={candidacy.experiences}
                readOnly={readOnly}
              />
            </div>
          </>
        ) : (
          <div className="grid md:grid-cols-2 grid-rows-1">
            <CertificationTile
              selectedCertificationId={candidacy?.certification?.id}
              readOnly={hasFeasibilitySent}
            />
            <TypeAccompagnementTile
              typeAccompagnement={candidacy.typeAccompagnement}
              disabled={hasFeasibilitySent}
            />
          </div>
        )}
      </DashboardTilesSection>

      <DashboardTilesSection
        title="Suivre mon parcours"
        icon="fr-icon-award-line"
      >
        <div className="grid grid-flow-row md:grid-flow-col md:grid-cols-2 grid-rows-1">
          <FeasibilityTile
            feasibility={feasibility}
            candidacyIsAutonome
            feasibilityFileResourceFirstRead={
              candidacy.feasibilityFileResourceFirstRead
            }
          />
          <DossierValidationTile
            feasibility={candidacy.feasibility}
            activeDossierDeValidation={candidacy.activeDossierDeValidation}
            jury={candidacy.jury}
          />
        </div>
      </DashboardTilesSection>
    </div>
  );
};
