"use client";

import Download from "@codegouvfr/react-dsfr/Download";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FancyUpload } from "@/components/fancy-upload/FancyUpload";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { useUrqlClient } from "@/components/urql-client";
import { File as GQLFile } from "@/graphql/generated/graphql";

import {
  createOrUpdateSwornStatement,
  useSwornStatement,
} from "./_components/swornStatement.hook";

const schema = z
  .object({
    swornStatement: z.object({
      0: z.instanceof(File, { message: "Merci de remplir ce champ" }),
    }),
  })
  .superRefine(({ swornStatement }, { addIssue }) => {
    if (!swornStatement?.[0]) {
      addIssue({
        path: ["idCard"],
        message: "Merci de remplir ce champ",
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
      swornStatement,
    };

    try {
      const result = await urqlClient.mutation(createOrUpdateSwornStatement, {
        input,
        candidacyId,
      });
      if (result.error) {
        throw new Error(result.error.graphQLErrors[0].message);
      }
      successToast("Attestation sur l'honneur mise à jour avec succès");
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
        L'attestation sur l'honneur est un document que doit fournir le candidat
        pour valider son dossier de faisabilité. Vous pouvez aussi télécharger
        notre modèle et le faire avec lui.
      </p>
      <h2 className="mb-0">Modèle d'attestation sur l'honneur</h2>
      <p className="text-xl mb-0">
        Ce modèle (aussi disponible sur l'espace candidat) est à remplir avec le
        candidat. Pensez à lui faire signer le document avant de le joindre.
      </p>
      <Download
        details="PDF - 1455 Ko"
        label="Modèle d'attestation sur l'honneur"
        linkProps={{
          title: "Attestation_sur_l_honneur_modèle",
          href: "/files/attestation_sur_l_honneur_modele.pdf",
          target: "_blank",
        }}
      />
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        onReset={(e) => {
          e.preventDefault();
          resetForm();
        }}
        className="mt-4"
      >
        <FancyUpload
          className="col-span-2"
          title="Joindre l'attestation sur l'honneur complétée et signée"
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
