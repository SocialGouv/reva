"use client";
import { FormButtons } from "../form/form-footer/FormButtons";
import { TreeSelect } from "../tree-select";
import {
  CertificationsFormData,
  useCertificationsForm,
} from "./CertificationsForm.hook";

type CertificationsFormCommonProps = {
  certifications: { id: string; label: string; selected: boolean }[];
  handleFormSubmit: (data: CertificationsFormData) => void;
  title?: string;
  fullWidth?: boolean;
  fullHeight?: boolean;
};

type CertificationsFormProps =
  | (CertificationsFormCommonProps & {
      hasBackButton?: false;
      backUrl?: never;
    })
  | (CertificationsFormCommonProps & {
      hasBackButton: true;
      backUrl: string;
    });

export const CertificationsForm = ({
  certifications,
  handleFormSubmit,
  title,
  fullWidth,
  fullHeight,
  hasBackButton,
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
          onClickSelectAll={(selected) => toggleAllCertifications(selected)}
          onClickItem={(i) => toggleCertification(i.id)}
        />
      </div>
      <FormButtons
        backUrl={hasBackButton ? backUrl : undefined}
        formState={{ isDirty, isSubmitting }}
      />
    </form>
  );
};
