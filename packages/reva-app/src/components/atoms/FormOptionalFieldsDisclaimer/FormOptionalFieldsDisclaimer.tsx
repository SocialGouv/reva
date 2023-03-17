export const FormOptionalFieldsDisclaimer = ({
  className,
}: {
  className?: string;
}) => (
  <p className={`text-dsfrGray-500 text-xs ${className}`}>
    Sauf mention contraire “(optionnel)” dans le label, tous les champs sont
    obligatoires.
  </p>
);
