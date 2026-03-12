import Button from "@codegouvfr/react-dsfr/Button";

export const BackButton = ({
  navigateBack,
  className,
  title,
}: {
  navigateBack: () => void;
  className?: string;
  title?: string;
}) => (
  <Button
    priority="secondary"
    onClick={navigateBack}
    type="button"
    aria-label="Retour à la page précédente"
    data-testid="back-button"
    className={className}
  >
    {title || "Retour"}
  </Button>
);
