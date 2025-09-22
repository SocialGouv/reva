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
  title?: string;
  fullWidth?: boolean;
  fullHeight?: boolean;
  backUrl?: string;
};

export const InterventionAreaForm = ({
  entityDepartments,
  regions,
  handleFormSubmit,
  title = "Cochez les régions ou départements gérés",
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
      <fieldset className="grid gap-x-8">
        <div className="flex flex-col gap-y-4 sm:gap-x-8">
          <legend className="text-2xl font-bold">Zone d'intervention</legend>
          <TreeSelect
            title={title}
            label="Toute la France"
            fullWidth={fullWidth}
            fullHeight={fullHeight}
            items={regionsAndDeparmController.field.value || []}
            onClickSelectAll={toggleAllRegionsAndDepartments}
            onClickItem={(i) => toggleRegionOrDepartment(i.id)}
          />
        </div>
      </fieldset>
      <FormButtons formState={{ isDirty, isSubmitting }} backUrl={backUrl} />
    </form>
  );
};
