import { Button } from "@codegouvfr/react-dsfr/Button";

export const CandidacyBackButton = ({
  candidacyId,
}: {
  candidacyId: string;
}) => {
  return (
    <Button
      className="mb-6"
      priority="tertiary"
      iconId="fr-icon-arrow-go-back-line"
      linkProps={{
        href: `/candidacies/${candidacyId}/summary`,
        target: "_self",
      }}
    >
      Aperçu de la candidature
    </Button>
  );
};
