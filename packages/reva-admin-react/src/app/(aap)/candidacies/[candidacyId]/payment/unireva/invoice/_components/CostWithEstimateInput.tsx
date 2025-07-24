import { Control, FieldPath, FieldValues } from "react-hook-form";

import { CostInput } from "../../../_components/form/CostInput";

export const CostWithEstimateInput = <T extends FieldValues = FieldValues>({
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
      <dt className="text-sm font-medium  mb-2">Coût horaire prévu</dt>
      <dd>{estimate} € </dd>
    </dl>
    <CostInput name={name} control={control} />
  </div>
);
