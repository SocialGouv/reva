import { Input } from "@codegouvfr/react-dsfr/Input";
import { Control } from "react-hook-form";
import { PaymentRequestUniFvaeFormData } from "../../paymentRequestUnifvaeInvoiceFormSchema";

export const HourInput = ({
  control,
  name,
}: {
  control: Control<PaymentRequestUniFvaeFormData>;
  name: keyof PaymentRequestUniFvaeFormData;
}) => (
  <Input
    label="NOMBRE D'HEURES"
    hintText="Exemple: saisir 2.5 pour 2H30"
    nativeInputProps={{
      type: "number",
      step: "0.5",
      min: 0,
      inputMode: "decimal",
      ...control.register(name, { valueAsNumber: true }),
    }}
    state={control.getFieldState(name).error ? "error" : "default"}
    stateRelatedMessage={control.getFieldState(name)?.error?.message}
  />
);
