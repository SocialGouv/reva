"use client";

import { useParams } from "next/navigation";
import { useCertificationsPage } from "./certifications.hooks";
import { z } from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { useCallback, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { CertificationAuthorityStructureBreadcrumb } from "../../../_components/certification-authority-structure-breadcrumb/CertificationAuthorityStructureBreadcrumb";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";

const schema = z.object({
  certifications: z
    .object({ id: z.string(), label: z.string(), checked: z.boolean() })
    .array(),
});

type FormData = z.infer<typeof schema>;

const CertificationAuthorityCertificationsPage = () => {
  const { certificationAuthorityStructureId, certificationAuthorityId } = useParams<{
    certificationAuthorityStructureId: string;
    certificationAuthorityId: string;
  }>();

  const {
    certificationAuthority,
    getCertificationAuthorityAndCertificationsStatus,
    allCertifications,
    updateCertificationAuthorityCertifications,
  } = useCertificationsPage({ certificationAuthorityId });

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { fields: certificationsFields } = useFieldArray({
    control,
    name: "certifications",
  });

  const resetForm = useCallback(
    () =>
      reset({
        certifications: allCertifications.map((c) => ({
          id: c.id,
          label: `${c.codeRncp} - ${c.label}`,
          checked: certificationAuthority?.certifications.some(
            (cert) => cert.id === c.id,
          ),
        })),
      }),
    [allCertifications, certificationAuthority?.certifications, reset],
  );

  const handleReset = useCallback(() => {
    resetForm();
  }, [resetForm]);

  useEffect(() => {
    handleReset();
  }, [handleReset]);

  const handleFormSubmit = handleSubmit(
    async (data) => {
      try {
        await updateCertificationAuthorityCertifications.mutateAsync({
          certificationAuthorityId,
          certificationIds: data.certifications
            .filter((c) => c.checked)
            .map((c) => c.id),
        });
        successToast("modifications enregistrées");
      } catch (e) {
        graphqlErrorToast(e);
      }
    },
    (e) => console.log({ e }),
  );

  if (getCertificationAuthorityAndCertificationsStatus !== "success") {
    return null;
  }

  return (
    <div className="flex flex-col flex-1">
      {certificationAuthority && (
        <div className="flex flex-col">
          <CertificationAuthorityStructureBreadcrumb
            certificationAuthorityStructureId={
              certificationAuthorityStructureId
            }
            certificationAuthorityStructureLabel={
              certificationAuthority.label
            }
            pageLabel={"Certifications gérées"}
          />
          <h1>Certifications gérées</h1>
          <p className="text-xl">
            Cochez les certifications proposées par la structure certificatrice.
            Vous pouvez choisir une ou plusieurs certifications.
          </p>
          <form
            className="flex flex-col mt-4"
            onSubmit={handleFormSubmit}
            onReset={(e) => {
              e.preventDefault();
              handleReset();
            }}
          >
            <div className="flex flex-col">
              <Checkbox
                options={certificationsFields.map((c, cIndex) => ({
                  label: c.label,
                  nativeInputProps: {
                    ...register(`certifications.${cIndex}.checked`),
                  },
                }))}
              />
            </div>
            <FormButtons
              backUrl={`/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthorityId}/`}
              formState={{ isDirty, isSubmitting }}
            />
          </form>
        </div>
      )}
    </div>
  );
};

export default CertificationAuthorityCertificationsPage;
