import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { ADMIN_ELM_URL } from "@/config/config";
import { Button } from "@codegouvfr/react-dsfr/Button";

export const CandidacyBackButton = ({
  candidacyId,
}: {
  candidacyId: string;
}) => {
  const { isFeatureActive } = useFeatureflipping();

  return (
    <Button
      className="mb-6"
      priority="tertiary"
      iconId="fr-icon-arrow-go-back-line"
      linkProps={{
        href: isFeatureActive("NEW_CANDIDACY_SUMMARY_PAGE")
          ? `/candidacies/${candidacyId}/summary`
          : `${ADMIN_ELM_URL}/candidacies/${candidacyId}`,
        target: "_self",
      }}
    >
      Aperçu de la candidature
    </Button>
  );
};
