import { addDays, format, isAfter } from "date-fns";

import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";

import {
  ACTUALISATION_THRESHOLD_DAYS,
  CADUQUITE_THRESHOLD_DAYS,
} from "../../banner-thresholds";
import { CandidacyUseCandidateForDashboard } from "../dashboard.hooks";

import { BaseBanner } from "./BaseBanner";

const HOURGLASS_IMAGE = "/candidat/images/image-hourglass.png";
const HOURGLASS_IMAGE_ALT = "Sablier";

interface ActualisationBannerProps {
  candidacy: CandidacyUseCandidateForDashboard;
}

export const ActualisationBanner = ({
  candidacy,
}: ActualisationBannerProps) => {
  const { lastActivityDate, status, feasibility, activeDossierDeValidation } =
    candidacy;

  const { isFeatureActive } = useFeatureFlipping();

  const removeFundingAndPaymentRequestsFromCandidacyStatusesFeatureActive =
    isFeatureActive(
      "REMOVE_FUNDING_AND_PAYMENT_REQUESTS_FROM_CANDIDACY_STATUSES",
    );

  const actualisationBannerThresholdDate = addDays(
    lastActivityDate as number,
    ACTUALISATION_THRESHOLD_DAYS,
  );

  const todayIsAfterActualisationBannerThresholdDate = isAfter(
    new Date(),
    actualisationBannerThresholdDate,
  );

  let isLastActiveStatusValidForActualisationBanner = false;

  if (removeFundingAndPaymentRequestsFromCandidacyStatusesFeatureActive) {
    isLastActiveStatusValidForActualisationBanner =
      status === "DOSSIER_FAISABILITE_RECEVABLE" ||
      status === "DOSSIER_DE_VALIDATION_SIGNALE" ||
      activeDossierDeValidation?.decision === "INCOMPLETE";
  } else {
    isLastActiveStatusValidForActualisationBanner =
      status === "DOSSIER_FAISABILITE_RECEVABLE" ||
      status === "DOSSIER_DE_VALIDATION_SIGNALE" ||
      status === "DEMANDE_FINANCEMENT_ENVOYE" ||
      (status === "DEMANDE_PAIEMENT_ENVOYEE" &&
        activeDossierDeValidation?.decision === "INCOMPLETE");
  }

  const shouldDisplayActualisationBanner =
    todayIsAfterActualisationBannerThresholdDate &&
    feasibility?.decision === "ADMISSIBLE" &&
    isLastActiveStatusValidForActualisationBanner;

  if (!shouldDisplayActualisationBanner) {
    return null;
  }

  const thresholdDate = format(
    addDays(lastActivityDate as number, CADUQUITE_THRESHOLD_DAYS),
    "dd/MM/yyyy",
  );

  return (
    <BaseBanner
      content={
        <div data-test="actualisation-banner">
          <strong>
            Actualisez-vous dès maintenant pour que votre recevabilité reste
            valable !
          </strong>{" "}
          Sans actualisation de votre part d'ici le {thresholdDate}, vous ne
          pourrez plus continuer votre parcours.
        </div>
      }
      imageSrc={HOURGLASS_IMAGE}
      imageAlt={HOURGLASS_IMAGE_ALT}
      actionButton={{
        href: "/actualisation",
        label: "S'actualiser",
        testId: "actualisation-banner-button",
      }}
    />
  );
};
