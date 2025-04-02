import { DossierDeValidationUseCandidateForDashboard } from "../dashboard.hooks";
import { BaseBanner } from "./BaseBanner";

interface DossierDeValidationBannerProps {
  activeDossierDeValidation: NonNullable<DossierDeValidationUseCandidateForDashboard>;
}

export const DossierDeValidationBanner = ({
  activeDossierDeValidation,
}: DossierDeValidationBannerProps) => {
  const { decision } = activeDossierDeValidation;

  if (decision === "PENDING") {
    return (
      <BaseBanner
        content={
          <div data-test="pending-dv-banner">
            Votre dossier de validation a bien été envoyé au certificateur. Vous
            recevrez prochainement une convocation pour votre passage devant le
            jury par mail ou par courrier. En cas d'erreur ou d'oubli,
            contactez-le pour pouvoir le modifier dans les plus brefs délais.
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
            comportait des erreurs. Rendez vous dans votre section "Dossier de
            validation" pour connaitre les raisons transmises par votre
            certificateur et transmettre un nouveau dossier de validation.
          </div>
        }
      />
    );
  }

  return null;
};
