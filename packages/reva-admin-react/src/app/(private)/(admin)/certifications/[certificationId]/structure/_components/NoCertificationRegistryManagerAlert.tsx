import { Alert } from "@codegouvfr/react-dsfr/Alert";

export const NoCertificationRegistryManagerAlert = ({
  className,
}: {
  className?: string;
}) => (
  <Alert
    data-testid="no-certification-registry-manager-alert"
    className={className}
    severity="warning"
    title="Cette structure certificatrice n’a aucun responsable des certifications pour le moment"
    description="Vous pouvez éditer et envoyer cette certification mais elle ne pourra être validée et publiée que par un responsable des certifications."
  />
);
