"use client";
import { FancyUpload } from "@/components/fancy-upload/FancyUpload";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { useUrqlClient } from "@/components/urql-client";
import { File as GQLFile } from "@/graphql/generated/graphql";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  createOrUpdateSwornStatement,
  useSwornStatement,
} from "./_components/swornStatement.hook";

const schema = z
  .object({
    swornStatement: z.object({
      0: z.instanceof(File, { message: "Ce champ est obligatoire" }),
    }),
  })
  .superRefine(({ swornStatement }, { addIssue }) => {
    if (!swornStatement?.[0]) {
      addIssue({
        path: ["idCard"],
        message: "Ce champ est obligatoire",
        code: z.ZodIssueCode.custom,
      });
    }
  });

type FormData = z.infer<typeof schema>;

export default function SwornStatementPage() {
  const { candidacyId } = useParams<{ candidacyId: string }>();
  const { swornStatementFile } = useSwornStatement();
  const urqlClient = useUrqlClient();
  const router = useRouter();
  const [swornStatement, setSwornStatement] = useState<GQLFile | undefined>();

  const feasibilitySummaryUrl = `/candidacies/${candidacyId}/feasibility-aap`;

  const resetFiles = useCallback(() => {
    if (!swornStatementFile) return;
    setSwornStatement(swornStatementFile);
  }, [swornStatementFile]);

  useEffect(() => {
    resetFiles();
  }, [resetFiles]);

  const defaultValues = useMemo(
    () => ({
      swornStatement: undefined,
    }),
    [],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleFormSubmit = async (data: FormData) => {
    const swornStatement = data.swornStatement?.[0];

    const input = {
      candidacyId,
      swornStatement,
    };

    try {
      const result = await urqlClient.mutation(createOrUpdateSwornStatement, {
        input,
      });
      if (result.error) {
        throw new Error(result.error.graphQLErrors[0].message);
      }
      successToast("Déclaration sur l'honneur mise à jour avec succès");
      router.push(`/candidacies/${candidacyId}/feasibility-aap`);
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  const resetForm = useCallback(() => {
    reset(defaultValues);
    resetFiles();
  }, [defaultValues, reset, resetFiles]);

  useEffect(() => {
    resetForm();
  }, [resetForm]);

  const swornStatementDefaultFile = useMemo(
    () =>
      swornStatement?.previewUrl
        ? {
            name: swornStatement.name,
            mimeType: swornStatement.mimeType,
            url: swornStatement.previewUrl,
          }
        : undefined,
    [swornStatement],
  );

  return (
    <div className="flex flex-col">
      <h1>Validation du candidat</h1>
      <FormOptionalFieldsDisclaimer />
      <p className="text-xl mb-12">
        Pour commencer le parcours VAE, le candidat doit lire et approuver le
        dossier de faisabilité. Il doit également vous faire parvenir une
        déclaration sur l'honneur, à transmettre ici.
      </p>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        onReset={(e) => {
          e.preventDefault();
          resetForm();
        }}
      >
        <FancyUpload
          className="col-span-2"
          title="Joindre la déclaration sur l'honneur signée "
          hint="Formats supportés : jpg, png, pdf avec un poids maximum de 2Mo"
          defaultFile={swornStatementDefaultFile}
          nativeInputProps={{
            required: true,
            ...register("swornStatement"),
            accept: ".pdf, .jpg, .jpeg, .png",
          }}
          state={errors.swornStatement ? "error" : "default"}
          stateRelatedMessage={errors.swornStatement?.[0]?.message}
        />

        <FormButtons
          backUrl={feasibilitySummaryUrl}
          formState={{
            isDirty,
            isSubmitting,
          }}
        />
      </form>
    </div>
  );
}
