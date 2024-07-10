export const FormOptionalFieldsDisclaimer = ({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) => (
  <p className={`text-dsfrGray-500 text-xs ${className}`}>
    {label ||
      "Sauf mention contraire “(optionnel)” dans le label, tous les champs sont obligatoires."}
  </p>
);
