import Button from "@codegouvfr/react-dsfr/Button";

export const BackButton = ({
  navigateBack,
  className,
}: {
  navigateBack: () => void;
  className?: string;
}) => (
  <Button
    priority="secondary"
    onClick={navigateBack}
    type="button"
    aria-label="Retour à la page précédente"
    data-testid="back-button"
    className={className}
  >
    Retour
  </Button>
);
