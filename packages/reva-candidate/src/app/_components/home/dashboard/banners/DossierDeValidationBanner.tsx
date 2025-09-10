import { DossierDeValidationUseCandidateForDashboard } from "../dashboard.hooks";

import { BaseBanner } from "./BaseBanner";

interface DossierDeValidationBannerProps {
  activeDossierDeValidation: NonNullable<DossierDeValidationUseCandidateForDashboard>;
}

const WARNING_IMAGE = "/candidat/images/image-warning-hand.png";
const WARNING_IMAGE_ALT = "Main levée en signe d'avertissement";

export const DossierDeValidationBanner = ({
  activeDossierDeValidation,
}: DossierDeValidationBannerProps) => {
  const { decision } = activeDossierDeValidation;

  if (decision === "PENDING" || decision === "COMPLETE") {
    return (
      <BaseBanner
        content={
          <div data-test="pending-dv-banner">
            Votre dossier de validation a bien été envoyé au certificateur. Vous
            recevrez prochainement une convocation pour votre passage devant le
            jury. En cas d’erreur ou d’oubli, contactez votre certificateur dans
            les plus brefs délais.
          </div>
        }
      />
    );
  }

  if (decision === "INCOMPLETE") {
    return (
      <BaseBanner
        content={
          <div data-test="incomplete-dv-banner">
            Le certificateur a signalé que votre dossier de validation
            comportait des erreurs. Rendez vous dans la section “Dossier de
            validation” pour connaitre les raisons et transmettre un nouveau
            dossier.
          </div>
        }
        imageSrc={WARNING_IMAGE}
        imageAlt={WARNING_IMAGE_ALT}
      />
    );
  }

  return null;
};
