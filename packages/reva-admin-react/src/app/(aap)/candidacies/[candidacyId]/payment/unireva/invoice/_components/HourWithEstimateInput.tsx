import { Control, FieldPath, FieldValues } from "react-hook-form";

import { HourInput } from "../../../_components/form/HourInput";

export const HourWithEstimateInput = <T extends FieldValues = FieldValues>({
  control,
  name,
  estimate = 0,
}: {
  control: Control<T>;
  name: FieldPath<T>;
  estimate?: number;
}) => (
  <div className="flex flex-col gap-6">
    <dl>
      <dt className="text-sm font-medium  mb-2">Nb d'heures prévues</dt>
      <dd>{estimate} h </dd>
    </dl>
    <HourInput name={name} control={control} />
  </div>
);
