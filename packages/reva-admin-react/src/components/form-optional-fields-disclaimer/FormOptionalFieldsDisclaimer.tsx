export const FormOptionalFieldsDisclaimer = ({
  classname,
}: {
  classname?: string;
}) => (
  <p
    className={`text-light-text-mention-grey text-xs leading-5 -mt-6 ${
      classname || ""
    }`}
  >
    Sauf mention contraire “(optionnel)” dans le label, tous les champs sont
    obligatoires.
  </p>
);
