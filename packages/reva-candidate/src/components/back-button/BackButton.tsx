import Button from "@codegouvfr/react-dsfr/Button";

export const BackButton = ({ navigateBack }: { navigateBack: () => void }) => (
  <Button
    priority="secondary"
    onClick={navigateBack}
    type="button"
    aria-label="Retour à la page précédente"
    data-test="back-button"
  >
    Retour
  </Button>
);
