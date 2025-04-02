import { BaseBanner } from "./BaseBanner";

interface CandidacySubmissionBannerProps {
  canSubmitCandidacy: boolean;
}

export const CandidacySubmissionBanner = ({
  canSubmitCandidacy,
}: CandidacySubmissionBannerProps) => {
  if (canSubmitCandidacy) {
    return (
      <BaseBanner
        content={
          <div data-test="can-submit-candidacy-banner">
            Votre candidature est correctement complétée ? Vous pouvez l'envoyer
            sans plus tarder !
          </div>
        }
      />
    );
  }

  return (
    <BaseBanner
      content={
        <div data-test="need-to-complete-info-banner">
          Pour envoyer votre candidature, vous devez avoir complété, vos
          informations dans <b>"Mon profil"</b> et toutes les catégories de la
          section <b>"Compléter ma candidature"</b>.
        </div>
      }
    />
  );
};
