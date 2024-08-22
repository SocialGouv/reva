import { TreeSelect, TreeSelectItem } from "@/components/tree-select";
import Button from "@codegouvfr/react-dsfr/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useController } from "react-hook-form";
import { z } from "zod";

export const schema = z.object({
  regions: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        selected: z.boolean(),
        children: z
          .array(
            z.object({
              id: z.string(),
              label: z.string(),
              selected: z.boolean(),
            }),
          )
          .default([]),
      }),
    )
    .default([]),

  certifications: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        selected: z.boolean(),
      }),
    )
    .default([]),
});

export type CertificationAuthorityFormData = z.infer<typeof schema>;

export const CertificationAuthorityForm = ({
  regions,
  certifications,
  onSubmit,
}: {
  regions: TreeSelectItem[];
  certifications: TreeSelectItem[];
  onSubmit: (data: CertificationAuthorityFormData) => Promise<void>;
}) => {
  const methods = useForm<CertificationAuthorityFormData>({
    resolver: zodResolver(schema),
    defaultValues: { regions, certifications },
  });
  const {
    control,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const certificationsController = useController({
    name: "certifications",
    control,
  });

  const regionsAndDeparmController = useController({
    name: "regions",
    control,
  });

  const toggleRegionOrDepartment = (regionOrdepartmentId: string) => {
    const type = regions.find((r) => r.id === regionOrdepartmentId)
      ? "region"
      : "department";

    if (type === "region") {
      toggleRegion(regionOrdepartmentId);
    } else {
      toggleDepartment(regionOrdepartmentId);
    }
  };

  const toggleRegion = (regionId: string) => {
    const newValues = [...regionsAndDeparmController.field.value];
    const regionIndex = newValues.findIndex((r) => r.id === regionId);
    const region = newValues[regionIndex];
    region.selected = !region.selected;
    for (const dep of region.children) {
      dep.selected = region.selected;
    }
    regionsAndDeparmController.field.onChange({ target: { value: newValues } });
  };

  const toggleDepartment = (departmentId: string) => {
    const newValues = [...regionsAndDeparmController.field.value];
    const regionIndex = newValues.findIndex(
      (r) => !!r.children.find((d) => d.id === departmentId),
    );
    const department = newValues[regionIndex].children.find(
      (d) => d.id === departmentId,
    );

    if (department) {
      department.selected = !department.selected;
    }
    const region = newValues[regionIndex];
    region.selected = region.children.every((d) => d.selected);
    regionsAndDeparmController.field.onChange({ target: { value: newValues } });
  };

  const toggleAllRegionsAndDepartments = (selected: boolean) => {
    const newValues = [...regionsAndDeparmController.field.value];
    for (const v of newValues) {
      v.selected = selected;
      for (const dv of v.children) {
        dv.selected = selected;
      }
    }
    regionsAndDeparmController.field.onChange({ target: { value: newValues } });
  };

  const toggleCertification = (certificationId: string) => {
    const newValues = [...certificationsController.field.value];
    const certificationIndex = newValues.findIndex(
      (c) => c.id === certificationId,
    );
    const oldCertification = newValues[certificationIndex];
    newValues.splice(certificationIndex, 1, {
      ...oldCertification,
      selected: !oldCertification.selected,
    });
    certificationsController.field.onChange({ target: { value: newValues } });
  };

  const toggleAllCertifications = (selected: boolean) => {
    const newValues = [...certificationsController.field.value];
    for (const v of newValues) {
      v.selected = selected;
    }
    certificationsController.field.onChange({ target: { value: newValues } });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onReset={() => reset()}
      className="flex flex-col"
    >
      <fieldset className="mt-3 grid grid-cols-2 gap-x-8">
        <div className="flex flex-col gap-y-4 sm:gap-x-8">
          <legend className="text-2xl font-bold">Zone d'intervention</legend>

          <TreeSelect
            title="Cochez les régions ou départements gérés"
            label="Toute la France"
            items={regionsAndDeparmController.field.value || []}
            onClickSelectAll={(selected) =>
              toggleAllRegionsAndDepartments(selected)
            }
            onClickItem={(i) => toggleRegionOrDepartment(i.id)}
          />
        </div>

        <div className="flex flex-col gap-y-4 sm:gap-x-8">
          <legend className="text-2xl font-bold">Certifications gérées</legend>

          <TreeSelect
            title="Cochez les certifications gérées"
            label="Toutes les certifications"
            items={certificationsController.field.value || []}
            onClickSelectAll={(selected) => toggleAllCertifications(selected)}
            onClickItem={(i) => toggleCertification(i.id)}
          />
        </div>
      </fieldset>
      <div className="flex flex-col md:flex-row gap-4 self-center md:self-end mt-10">
        <Button priority="secondary" type="reset">
          Annuler les modifications
        </Button>
        <Button disabled={isSubmitting}>Valider</Button>
      </div>
    </form>
  );
};
