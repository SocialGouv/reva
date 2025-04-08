import { CandidacyUseCandidateForDashboard } from "../dashboard.hooks";
import { CertificationTile } from "../tiles/CertificationTile";
import { DossierValidationTile } from "../tiles/DossierValidationTile";
import { FeasibilityTile } from "../tiles/FeasibilityTile";
import { TypeAccompagnementTile } from "../tiles/TypeAccompagnementTile";
import { DashboardTilesSection } from "./DashboardTilesSection";

export const DashboardAutonomeTilesGroup = ({
  candidacy,
}: {
  candidacy: CandidacyUseCandidateForDashboard;
}) => {
  const candidacyIsCaduque = candidacy?.isCaduque;
  const feasibility = candidacy?.feasibility;

  return (
    <>
      <DashboardTilesSection
        title="Compléter ma candidature"
        icon="fr-icon-ball-pen-line"
      >
        <div className="grid md:grid-cols-2 grid-rows-1">
          <CertificationTile
            selectedCertificationId={candidacy?.certification?.id}
          />
          <TypeAccompagnementTile
            typeAccompagnement={candidacy.typeAccompagnement}
          />
        </div>
      </DashboardTilesSection>

      <DashboardTilesSection
        title="Suivre mon parcours"
        icon="fr-icon-award-line"
      >
        <div className="grid grid-flow-row md:grid-flow-col md:grid-cols-2 grid-rows-1">
          <FeasibilityTile
            feasibility={feasibility}
            isCaduque={candidacyIsCaduque}
            candidacyIsAutonome={true}
          />
          <DossierValidationTile
            feasibility={candidacy.feasibility}
            activeDossierDeValidation={candidacy.activeDossierDeValidation}
            isCaduque={candidacy.isCaduque}
            jury={candidacy.jury}
          />
        </div>
      </DashboardTilesSection>
    </>
  );
};
