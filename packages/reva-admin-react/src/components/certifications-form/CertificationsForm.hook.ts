import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useController } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  certifications: z
    .object({ id: z.string(), label: z.string(), selected: z.boolean() })
    .array(),
});

export type CertificationsFormData = z.infer<typeof schema>;

export const useCertificationsForm = ({
  certifications,
}: {
  certifications: { id: string; label: string; selected: boolean }[];
}) => {
  const {
    control,
    setValue,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm<CertificationsFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      certifications: certifications,
    },
  });

  const certificationsController = useController({
    name: "certifications",
    control,
  });

  const toggleCertification = (certificationId: string) => {
    const newValues = certificationsController.field.value.map((c) => ({
      ...c,
      selected: c.id === certificationId ? !c.selected : c.selected,
    }));
    setValue("certifications", newValues, {
      shouldDirty: true,
    });
  };

  const toggleAllCertifications = (selected: boolean) => {
    const newValues = certificationsController.field.value.map((c) => ({
      ...c,
      selected,
    }));
    setValue("certifications", newValues, {
      shouldDirty: true,
    });
  };

  return {
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
    certificationsController,
    toggleCertification,
    toggleAllCertifications,
  };
};
