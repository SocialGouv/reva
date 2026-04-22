import { Input } from "@codegouvfr/react-dsfr/Input";
import { Control, FieldPath, FieldValues } from "react-hook-form";

export const CostInput = <T extends FieldValues = FieldValues>({
  control,
  name,
}: {
  control: Control<T>;
  name: FieldPath<T>;
}) => (
  <Input
    label="Coût Horaire"
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
