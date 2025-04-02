import { addDays, isAfter } from "date-fns";
import { ACTUALISATION_THRESHOLD_DAYS } from "../../banner-thresholds";
import { CandidacyUseCandidateForDashboard } from "../dashboard.hooks";
import { ActualisationBanner } from "./ActualisationBanner";
import { AppointmentsBanner } from "./AppointmentsBanner";
import { CandidacyCaduciteBanner } from "./CandidacyCaduciteBanner";
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
    lastActivityDate,
    isCaduque,
    feasibility,
    status,
    activeDossierDeValidation,
    jury,
    candidacyDropOut,
    candidacyContestationsCaducite,
    typeAccompagnement,
  } = candidacy;

  const lastActiveStatus = status;
  const candidacyIsAutonome = typeAccompagnement === "AUTONOME";
  const candidacyIsAccompagne = typeAccompagnement === "ACCOMPAGNE";

  const isLastActiveStatusValidForActualisationBanner =
    lastActiveStatus === "DOSSIER_FAISABILITE_RECEVABLE" ||
    lastActiveStatus === "DOSSIER_DE_VALIDATION_SIGNALE" ||
    lastActiveStatus === "DEMANDE_FINANCEMENT_ENVOYE" ||
    (lastActiveStatus === "DEMANDE_PAIEMENT_ENVOYEE" &&
      activeDossierDeValidation?.decision === "INCOMPLETE");

  let todayIsAfterActualisationBannerThresholdDate = false;

  if (lastActivityDate) {
    const actualisationBannerThresholdDate = addDays(
      lastActivityDate,
      ACTUALISATION_THRESHOLD_DAYS,
    );
    todayIsAfterActualisationBannerThresholdDate = isAfter(
      new Date(),
      actualisationBannerThresholdDate,
    );
  }

  const displayActualisationBanner = !!(
    lastActivityDate &&
    !isCaduque &&
    feasibility?.decision === "ADMISSIBLE" &&
    todayIsAfterActualisationBannerThresholdDate &&
    isLastActiveStatusValidForActualisationBanner
  );

  const displayDossierDeValidationBanner = !!(
    activeDossierDeValidation?.decision === "PENDING" ||
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

  if (isCaduque) {
    return (
      <CandidacyCaduciteBanner
        candidacyContestationsCaducite={candidacyContestationsCaducite}
      />
    );
  }

  if (displayActualisationBanner) {
    return <ActualisationBanner candidacy={candidacy} />;
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

  return <CandidacySubmissionBanner canSubmitCandidacy={canSubmitCandidacy} />;
};
