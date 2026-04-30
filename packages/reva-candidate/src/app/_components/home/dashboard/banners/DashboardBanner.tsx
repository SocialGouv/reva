import { CandidacyUseCandidateForDashboard } from "../dashboard.hooks";

import { AppointmentsBanner } from "./AppointmentsBanner";
import { CandidacyDropOutBanner } from "./CandidacyDropOutBanner";
import { CandidacySubmissionBanner } from "./CandidacySubmissionBanner";
import { DossierDeValidationBanner } from "./DossierDeValidationBanner";
import { FeasibilityBanner } from "./FeasibilityBanner";
import { JuryBanner } from "./JuryBanner";

type BannerProps = {
  candidacy: CandidacyUseCandidateForDashboard;
  candidacyAlreadySubmitted: boolean;
  canSubmitCandidacy: boolean;
};

export const DashboardBanner = (props: BannerProps) => {
  if (!props.candidacy) {
    return null;
  }

  const { candidacy, candidacyAlreadySubmitted, canSubmitCandidacy } = props;

  const {
    feasibility,
    status,
    activeDossierDeValidation,
    jury,
    candidacyDropOut,
    typeAccompagnement,
  } = candidacy;

  const candidacyIsAutonome = typeAccompagnement === "AUTONOME";
  const candidacyIsAccompagne = typeAccompagnement === "ACCOMPAGNE";

  const displayDossierDeValidationBanner = !!(
    activeDossierDeValidation?.decision === "PENDING" ||
    activeDossierDeValidation?.decision === "COMPLETE" ||
    activeDossierDeValidation?.decision === "INCOMPLETE"
  );

  // Afficher la bannière dès qu'un dossier de faisabilité existe, sauf s'il est en statut DRAFT pour un parcours AUTONOME
  const displayFeasibilityBanner = !!(
    feasibility?.decision &&
    (candidacyIsAccompagne ||
      (candidacyIsAutonome && feasibility.decision !== "DRAFT"))
  );

  const displayAppointmentsBanner = !!(
    candidacyAlreadySubmitted && candidacyIsAccompagne
  );

  if (candidacyDropOut) {
    return <CandidacyDropOutBanner candidacyDropOut={candidacyDropOut} />;
  }

  if (jury) {
    return <JuryBanner jury={jury} />;
  }

  if (displayDossierDeValidationBanner) {
    return (
      <DossierDeValidationBanner
        activeDossierDeValidation={activeDossierDeValidation}
      />
    );
  }

  if (displayFeasibilityBanner) {
    return (
      <FeasibilityBanner
        feasibility={feasibility}
        typeAccompagnement={typeAccompagnement}
        readyForJuryEstimatedAt={candidacy.readyForJuryEstimatedAt}
      />
    );
  }

  if (displayAppointmentsBanner) {
    return (
      <AppointmentsBanner
        candidacyAlreadySubmitted={candidacyAlreadySubmitted}
        firstAppointmentOccuredAt={candidacy.firstAppointmentOccuredAt}
        organism={candidacy.organism}
        status={status}
      />
    );
  }

  return (
    <CandidacySubmissionBanner
      canSubmitCandidacy={canSubmitCandidacy}
      isAutonome={candidacyIsAutonome}
    />
  );
};
