"use client";

import { Input } from "@codegouvfr/react-dsfr/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { sanitizedText } from "@/utils/input-sanitization";

import { CertificationAuthorityStructureBreadcrumb } from "../_components/certification-authority-structure-breadcrumb/CertificationAuthorityStructureBreadcrumb";

import { useInformationGeneralesPage } from "./informationsGenerales.hooks";

const schema = z.object({
  label: sanitizedText(),
});

type FormData = z.infer<typeof schema>;

const CertificationAuthorityStructureInformationsGeneralesPage = () => {
  const { certificationAuthorityStructureId } = useParams<{
    certificationAuthorityStructureId: string;
  }>();

  const {
    certificationAuthorityStructure,
    getCertificationAuthorityStructureStatus,
    updateCertificationAuthorityStructure,
  } = useInformationGeneralesPage({ certificationAuthorityStructureId });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { ...certificationAuthorityStructure },
  });

  const handleFormSubmit = handleSubmit(
    async (data) => {
      try {
        await updateCertificationAuthorityStructure.mutateAsync({
          certificationAuthorityStructureId,
          certificationAuthorityStructureLabel: data.label,
        });
        successToast("modifications enregistrées");
      } catch (e) {
        graphqlErrorToast(e);
      }
    },
    (e) => console.log({ e }),
  );

  const handleReset = useCallback(() => {
    reset({
      ...certificationAuthorityStructure,
    });
  }, [certificationAuthorityStructure, reset]);

  useEffect(() => {
    handleReset();
  }, [handleReset]);

  if (getCertificationAuthorityStructureStatus !== "success") {
    return null;
  }

  return (
    <div className="flex flex-col flex-1">
      {certificationAuthorityStructure && (
        <div className="flex flex-col">
          <CertificationAuthorityStructureBreadcrumb
            certificationAuthorityStructureId={
              certificationAuthorityStructureId
            }
            certificationAuthorityStructureLabel={
              certificationAuthorityStructure.label
            }
            pageLabel={"Informations générales"}
          />
          <h1>Informations générales</h1>
          <p className="text-xl">
            Retrouvez ici les informations liées à la structure certificatrice.
            Vous pouvez signaler un changement au support si elles ne sont plus
            à jour.
          </p>
          <form
            className="flex flex-col mt-4"
            onSubmit={handleFormSubmit}
            onReset={(e) => {
              e.preventDefault();
              handleReset();
            }}
          >
            <Input
              label="Nom de la structure certificatrice"
              nativeInputProps={{
                ...register("label"),
              }}
              state={errors.label ? "error" : "default"}
              stateRelatedMessage={errors.label?.message}
            />
            <FormButtons
              backUrl={`/certification-authority-structures/${certificationAuthorityStructureId}`}
              formState={{ isDirty, isSubmitting }}
            />
          </form>
        </div>
      )}
    </div>
  );
};

export default CertificationAuthorityStructureInformationsGeneralesPage;
