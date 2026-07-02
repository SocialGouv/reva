import { FormButtons } from "../form/form-footer/FormButtons";
import { TreeSelect } from "../tree-select/TreeSelect.component";

import {
  Deparment,
  InterventionAreaFormData,
  Region,
  useInterventionAreaFormLogic,
} from "./InterventionAreaForm.hook";

type InterventionAreaFormProps = {
  entityDepartments: Deparment[];
  regions: Region[];
  handleFormSubmit: (data: InterventionAreaFormData) => void;
  fullWidth?: boolean;
  fullHeight?: boolean;
  backUrl?: string;
};

export const InterventionAreaForm = ({
  entityDepartments,
  regions,
  handleFormSubmit,
  fullWidth,
  fullHeight,
  backUrl,
}: InterventionAreaFormProps) => {
  const {
    regionsAndDeparmController,
    handleSubmit,
    toggleRegionOrDepartment,
    toggleAllRegionsAndDepartments,
    reset,
    isSubmitting,
    isDirty,
  } = useInterventionAreaFormLogic({
    entityDepartments,
    regions,
  });

  const onSubmit = handleSubmit(handleFormSubmit);
  return (
    <form
      onSubmit={onSubmit}
      onReset={(e) => {
        e.preventDefault();
        reset();
      }}
      className="flex flex-col w-full"
    >
      <div className="flex flex-col gap-y-4 sm:gap-x-8">
        <TreeSelect
          label="Toute la France"
          fullWidth={fullWidth}
          fullHeight={fullHeight}
          items={regionsAndDeparmController.field.value || []}
          onClickSelectAll={toggleAllRegionsAndDepartments}
          onClickItem={(i) => toggleRegionOrDepartment(i.id)}
        />
      </div>
      <FormButtons formState={{ isDirty, isSubmitting }} backUrl={backUrl} />
    </form>
  );
};
