import { BaseBanner } from "./BaseBanner";

interface CandidacySubmissionBannerProps {
  canSubmitCandidacy: boolean;
  isAutonome: boolean;
}

export const CandidacySubmissionBanner = ({
  canSubmitCandidacy,
  isAutonome,
}: CandidacySubmissionBannerProps) => {
  if (isAutonome) {
    return (
      <BaseBanner
        content={
          <div data-testid="need-to-complete-info-banner">
            La première étape de votre parcours de VAE est de réaliser une
            candidature dans la section “Dossier de faisabilité”. Ce dossier
            permet de vérifier que votre projet de VAE est réaliste et
            réalisable.
          </div>
        }
      />
    );
  }
  if (canSubmitCandidacy) {
    return (
      <BaseBanner
        content={
          <div data-testid="can-submit-candidacy-banner">
            Votre candidature est correctement complétée ? Vous pouvez l’envoyer
            à votre accompagnateur dès maintenant !
          </div>
        }
      />
    );
  }

  return (
    <BaseBanner
      content={
        <div data-testid="need-to-complete-info-banner">
          Pour envoyer votre candidature à votre accompagnateur, complétez
          toutes les catégories de la section “Compléter ma candidature”. Tant
          que votre candidature n'est pas envoyée, votre accompagnateur n'y aura
          pas accès.
        </div>
      }
    />
  );
};
