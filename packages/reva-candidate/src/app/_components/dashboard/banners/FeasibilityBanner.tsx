import { FeasibilityUseCandidateForDashboard } from "../dashboard.hooks";
import { BaseBanner } from "./BaseBanner";

interface FeasibilityBannerProps {
  feasibility: NonNullable<FeasibilityUseCandidateForDashboard>;
  typeAccompagnement: string;
  readyForJuryEstimatedAt?: number;
}

const WARNING_IMAGE = "/candidat/images/image-warning-hand.png";
const WARNING_IMAGE_ALT = "Main levée en signe d'avertissement";

export const FeasibilityBanner = ({
  feasibility,
  typeAccompagnement,
  readyForJuryEstimatedAt,
}: FeasibilityBannerProps) => {
  const { decision } = feasibility;

  if (decision === "ADMISSIBLE" && typeAccompagnement === "AUTONOME") {
    return (
      <BaseBanner
        content={
          <div data-test="autonome-admissible-feasibility-banner">
            Félicitations, vous êtes recevable ! Vous pouvez, débuter la
            rédaction de votre dossier de validation.{" "}
            {!readyForJuryEstimatedAt && (
              <>
                Afin de simplifier l'organisation de votre jury, vous pouvez
                renseigner une date prévisionnelle de dépôt dans la section
                "Dossier de validation".
              </>
            )}
          </div>
        }
      />
    );
  }

  if (decision === "ADMISSIBLE" && typeAccompagnement === "ACCOMPAGNE") {
    return (
      <BaseBanner
        content={
          <div data-test="accompagne-admissible-feasibility-banner">
            Félicitations, votre dossier de faisabilité est recevable ! Votre
            accompagnateur vous contactera prochainement pour démarrer votre
            accompagnement. Vous pourrez, ensemble, débuter la rédaction de
            votre dossier de validation.
          </div>
        }
      />
    );
  }

  if (decision === "DRAFT" && typeAccompagnement === "ACCOMPAGNE") {
    return (
      <BaseBanner
        content={
          <div data-test="draft-feasibility-banner">
            Votre dossier de faisabilité est désormais consultable ! Si le
            contenu proposé vous convient, transmettez une attestation sur
            l'honneur signée à votre accompagnateur pour valider le dossier de
            faisabilité.
          </div>
        }
      />
    );
  }

  if (decision === "PENDING") {
    const isPendingAccompagne = typeAccompagnement === "ACCOMPAGNE";
    return (
      <BaseBanner
        content={
          <div
            data-test={
              isPendingAccompagne
                ? "pending-feasibility-banner"
                : "autonome-pending-feasibility-banner"
            }
          >
            Votre dossier a été envoyé au certificateur.{" "}
            {isPendingAccompagne ? "Votre accompagnateur et vous-même" : "Vous"}{" "}
            recevrez un e-mail et/ou un courrier dans un délai de 2 mois maximum
            vous informant si vous êtes recevable pour commencer un parcours VAE
            !
          </div>
        }
      />
    );
  }

  if (decision === "INCOMPLETE") {
    const isAccompagne = typeAccompagnement === "ACCOMPAGNE";
    return (
      <BaseBanner
        content={
          <div
            data-test={
              isAccompagne
                ? "incomplete-feasibility-banner"
                : "autonome-incomplete-feasibility-banner"
            }
          >
            Votre dossier de faisabilité est incomplet. Cliquez sur "Dossier de
            faisabilité" pour découvrir les éléments manquants puis
            {isAccompagne
              ? " contactez votre accompagnateur afin qu'il mette votre dossier à jour."
              : " soumettez un dossier mis à jour."}
          </div>
        }
      />
    );
  }

  if (decision === "REJECTED") {
    return (
      <BaseBanner
        content={
          <div data-test="rejected-feasibility-banner">
            Malheureusement, votre dossier de faisabilité n'a pas été accepté
            par le certificateur. Vous pouvez soit contester cette décision soit
            arrêter votre parcours VAE ici.
          </div>
        }
        imageSrc={WARNING_IMAGE}
        imageAlt={WARNING_IMAGE_ALT}
      />
    );
  }

  return null;
};
