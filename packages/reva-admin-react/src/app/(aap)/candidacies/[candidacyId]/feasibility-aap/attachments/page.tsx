"use client";
import { FancyUpload } from "@/components/fancy-upload/FancyUpload";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { useUrqlClient } from "@/components/urql-client";
import { File as FileType } from "@/graphql/generated/graphql";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { object, z } from "zod";
import {
  createOrUpdateAttachments,
  useAttachments,
} from "./_components/attachments.hook";

// Utility function to convert custom file object to File
function createFileFromCustomObject(file: FileType) {
  return new File([file.url], file.name, { type: file.mimeType });
}

// Function to create a FileList-like object
function createFileList(files: FileType[]) {
  const dataTransfer = new DataTransfer();
  files.forEach((file) => {
    const fileObject = createFileFromCustomObject(file);
    dataTransfer.items.add(fileObject);
  });
  return dataTransfer.files;
}

const schema = z
  .object({
    idCard: z.object({
      0: z.instanceof(File, { message: "Ce champ est obligatoire" }),
    }),
    equivalenceOrExemptionProof: z
      .object({
        0: z.undefined().or(z.instanceof(File)),
      })
      .optional(),
    trainingCertificate: z
      .object({
        0: z.undefined().or(z.instanceof(File)),
      })
      .optional(),
    additionalFiles: z.array(
      object({
        0: z.undefined().or(z.instanceof(File)),
      }),
    ),
  })
  .superRefine(({ idCard }, { addIssue }) => {
    if (!idCard?.[0]) {
      addIssue({
        path: ["idCard"],
        message: "Ce champ est obligatoire",
        code: z.ZodIssueCode.custom,
      });
    }
  });

type FormData = z.infer<typeof schema>;

export default function AttachmentsPage() {
  const { candidacyId } = useParams() satisfies { candidacyId: string };
  const urqlClient = useUrqlClient();
  const router = useRouter();
  const { attachments } = useAttachments();

  const idCard = attachments?.find(
    (attachment) => attachment?.type === "ID_CARD",
  )?.file;
  const equivalenceOrExemptionProof = attachments?.find(
    (attachment) => attachment?.type === "EQUIVALENCE_OR_EXEMPTION_PROOF",
  )?.file;
  const trainingCertificate = attachments?.find(
    (attachment) => attachment?.type === "TRAINING_CERTIFICATE",
  )?.file;
  const additionalFiles = useMemo(
    () =>
      attachments
        ? attachments
            ?.filter((attachment) => attachment?.type === "ADDITIONAL")
            ?.map((attachment) =>
              attachment
                ? { 0: createFileFromCustomObject(attachment.file) }
                : undefined,
            )
        : [],

    [attachments],
  );
  const [additionalFilesState, setAdditionalFilesState] =
    useState<({ 0: File } | undefined)[]>(additionalFiles);

  const defaultValues = useMemo(
    () => ({
      idCard: idCard ? { 0: createFileFromCustomObject(idCard) } : undefined,
      equivalenceOrExemptionProof: equivalenceOrExemptionProof
        ? { 0: createFileFromCustomObject(equivalenceOrExemptionProof) }
        : undefined,
      trainingCertificate: trainingCertificate
        ? { 0: createFileFromCustomObject(trainingCertificate) }
        : undefined,
      additionalFiles: additionalFilesState,
    }),
    [
      idCard,
      equivalenceOrExemptionProof,
      trainingCertificate,
      additionalFilesState,
    ],
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
    const idCard = data.idCard?.[0];
    const equivalenceOrExemptionProof = data.equivalenceOrExemptionProof?.[0];
    const trainingCertificate = data.trainingCertificate?.[0];
    const additionalFiles = data.additionalFiles
      .filter((file) => Boolean(file?.[0]))
      .map((file) => file[0]);
    const input = {
      candidacyId,
      idCard,
      equivalenceOrExemptionProof,
      trainingCertificate,
      additionalFiles,
    };

    try {
      const result = await urqlClient.mutation(createOrUpdateAttachments, {
        input,
      });
      if (result.error) {
        throw new Error(result.error.graphQLErrors[0].message);
      }
      successToast("Pièces jointes mises à jour avec succès");
      router.push(`/candidacies/${candidacyId}/feasibility-aap`);
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  const resetForm = useCallback(
    () => reset(defaultValues),
    [reset, defaultValues],
  );

  useEffect(resetForm, [resetForm]);
  return (
    <div className="flex flex-col">
      <h1>Pièces jointes</h1>
      <FormOptionalFieldsDisclaimer />
      <p className="text-xl mb-12">
        Ajoutez toutes les pièces jointes nécessaires à la validation du dossier
        de recevabilité. Si nécessaire, vous pouvez revenir sur cet espace pour
        les ajouter au fur et à mesure.
      </p>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        onReset={(e) => {
          e.preventDefault();
          resetForm();
        }}
      >
        <div className="flex flex-col gap-8 mb-2">
          <FancyUpload
            className="col-span-2"
            title="Pièce d'identité"
            description="Copie d'une pièce d'identité en cours de validité (la photo et les informations doivent être nettes). Le candidat devra montrer cette pièce lors du passage devant jury et en aura besoin pour la délivrance éventuelle de la certification. Sont valables les cartes d'identité, les passeports et les cartes de séjour."
            hint="Formats supportés : jpg, png, pdf avec un poids maximum de 2Mo"
            nativeInputProps={{
              ...register("idCard"),
              accept: ".pdf, .jpg, .jpeg, .png",
            }}
            state={errors.idCard ? "error" : "default"}
            stateRelatedMessage={errors.idCard?.[0]?.message}
          />
          <FancyUpload
            className="col-span-2"
            title="Justificatif d'équivalence ou de dispense (optionnel)"
            description="Copie du ou des justificatifs ouvrant accès à une équivalence ou dispense en lien avec la certification visée."
            hint="Formats supportés : jpg, png, pdf avec un poids maximum de 2Mo"
            nativeInputProps={{
              ...register("equivalenceOrExemptionProof"),
              accept: ".pdf, .jpg, .jpeg, .png",
            }}
            state={errors.equivalenceOrExemptionProof ? "error" : "default"}
            stateRelatedMessage={
              errors.equivalenceOrExemptionProof?.[0]?.message
            }
          />
          <FancyUpload
            className="col-span-2"
            title="Attestation ou certificat de formation (optionnel)"
            description="Attestation ou certificat de suivi de formation justifiant du pré-requis demandé par la certification visée."
            hint="Formats supportés : jpg, png, pdf avec un poids maximum de 2Mo"
            nativeInputProps={{
              ...register("trainingCertificate"),
              accept: ".pdf, .jpg, .jpeg, .png",
            }}
            state={errors.trainingCertificate ? "error" : "default"}
            stateRelatedMessage={errors.trainingCertificate?.[0]?.message}
          />
          {additionalFilesState.map((_, index) => (
            <FancyUpload
              className="col-span-2"
              title="Pièce jointe supplémentaire"
              description=""
              hint="Formats supportés : jpg, png, pdf avec un poids maximum de 2Mo"
              nativeInputProps={{
                ...register(`additionalFiles.${index}`),
                accept: ".pdf, .jpg, .jpeg, .png",
              }}
              state={errors.additionalFiles?.[index] ? "error" : "default"}
              stateRelatedMessage={errors.additionalFiles?.[index]?.message}
              key={index}
            />
          ))}
          <div
            className="flex cursor-pointer gap-2 text-blue-900 items-center w-fit"
            onClick={() => {
              setAdditionalFilesState((prev) => [...prev, undefined]);
            }}
          >
            <span className="fr-icon-add-line fr-icon--sm" />
            <span className="text-sm">Ajouter un pré-requis</span>
          </div>
        </div>
        <FormButtons
          backUrl={`/candidacies/${candidacyId}/feasibility-aap`}
          formState={{
            isDirty,
            isSubmitting,
          }}
        />
      </form>
    </div>
  );
}
