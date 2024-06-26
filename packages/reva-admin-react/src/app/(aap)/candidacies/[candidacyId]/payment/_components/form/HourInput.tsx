import { Input } from "@codegouvfr/react-dsfr/Input";
import { Control, FieldPath, FieldValues } from "react-hook-form";

export const HourInput = <T extends FieldValues = FieldValues>({
  control,
  name,
}: {
  control: Control<T>;
  name: FieldPath<T>;
}) => (
  <Input
    label="Nombre d'heures"
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
