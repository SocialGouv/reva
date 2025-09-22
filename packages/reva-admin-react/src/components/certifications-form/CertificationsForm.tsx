"use client";

import { FormButtons } from "../form/form-footer/FormButtons";
import { TreeSelect } from "../tree-select/TreeSelect.component";

import {
  CertificationsFormData,
  useCertificationsForm,
} from "./CertificationsForm.hook";

type CertificationsFormProps = {
  certifications: { id: string; label: string; selected: boolean }[];
  handleFormSubmit: (data: CertificationsFormData) => void;
  title?: string;
  fullWidth?: boolean;
  fullHeight?: boolean;
  backUrl?: string;
};

export const CertificationsForm = ({
  certifications,
  handleFormSubmit,
  title,
  fullWidth,
  fullHeight,
  backUrl,
}: CertificationsFormProps) => {
  const {
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
    certificationsController,
    toggleCertification,
    toggleAllCertifications,
  } = useCertificationsForm({ certifications });

  const onSubmit = handleSubmit(handleFormSubmit);

  return (
    <form
      className="flex flex-col mt-4"
      onSubmit={onSubmit}
      onReset={(e) => {
        e.preventDefault();
        reset();
      }}
    >
      <div className="flex flex-col">
        <TreeSelect
          title={title ?? ""}
          label="Toutes les certifications"
          fullWidth={fullWidth}
          fullHeight={fullHeight}
          items={certificationsController.field.value || []}
          onClickSelectAll={toggleAllCertifications}
          onClickItem={(i) => toggleCertification(i.id)}
        />
      </div>
      <FormButtons backUrl={backUrl} formState={{ isDirty, isSubmitting }} />
    </form>
  );
};
