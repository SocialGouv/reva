import { Alert } from "@codegouvfr/react-dsfr/Alert";

export const NoCertificationAuthorityAlert = ({
  className,
}: {
  className?: string;
}) => (
  <Alert
    data-testid="no-certification-authority-alert"
    className={className}
    severity="warning"
    title="Il n’y a pas de gestionnaire des candidatures pour cette certification"
    description="Malgré cela, elle sera visible des candidats et des AAP dès sa validation par le responsable des certifications. Lors du premier dossier de faisabilité envoyé, et s’il n’y a toujours pas de gestionnaire des candidatures, le support sera averti du problème."
  />
);
