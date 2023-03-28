export const FormOptionalFieldsDisclaimer = ({
  className,
}: {
  className?: string;
}) => (
  <p className={`text-sm ${className}`}>
    Sauf mention contraire “(optionnel)” dans le label, tous les champs sont
    obligatoires.
  </p>
);
