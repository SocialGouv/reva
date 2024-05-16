export const FormOptionalFieldsDisclaimer = ({
  className,
}: {
  className?: string;
}) => (
  <p className={`mt-1 text-xs text-gray-600 font-normal ${className}`}>
    Sauf mention contraire “(optionnel)” dans le label, tous les champs sont
    obligatoires.
  </p>
);
