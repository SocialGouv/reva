import { Input } from "@codegouvfr/react-dsfr/Input";
import { Control } from "react-hook-form";
import { PaymentRequestUniFvaeInvoiceFormData } from "../../paymentRequestUnifvaeInvoiceFormSchema";

export const CostInput = ({
  control,
  name,
}: {
  control: Control<PaymentRequestUniFvaeInvoiceFormData>;
  name: keyof PaymentRequestUniFvaeInvoiceFormData;
}) => (
  <Input
    label="COÛT HORAIRE"
    hintText="Un décimal supérieur ou égal à 0"
    nativeInputProps={{
      type: "number",
      step: "0.01",
      min: 0,
      inputMode: "decimal",
      ...control.register(name, { valueAsNumber: true }),
    }}
    state={control.getFieldState(name).error ? "error" : "default"}
    stateRelatedMessage={control.getFieldState(name)?.error?.message}
  />
);
