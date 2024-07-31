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
import { useFieldArray, useForm } from "react-hook-form";
import { object, z } from "zod";
import {
  createOrUpdateAttachments,
  useAttachments,
} from "./_components/attachments.hook";
import { v4 } from "uuid";

const schema = z
  .object({
    idCard: z.object({
      0: z.instanceof(File, { message: "Merci de remplir ce champ" }),
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
        message: "Merci de remplir ce champ",
        code: z.ZodIssueCode.custom,
      });
    }
  });

type FormData = z.infer<typeof schema>;

const MAX_ADDITIONAL_FILES = 2;

export default function AttachmentsPage() {
  const router = useRouter();
  const urqlClient = useUrqlClient();

  const { candidacyId } = useParams() satisfies { candidacyId: string };

  const { attachments } = useAttachments();

  const remoteIdCard = useMemo(
    () =>
      attachments?.find((attachment) => attachment?.type === "ID_CARD")?.file,
    [attachments],
  );
  const remoteEquivalenceOrExemptionProof = useMemo(
    () =>
      attachments?.find(
        (attachment) => attachment?.type === "EQUIVALENCE_OR_EXEMPTION_PROOF",
      )?.file,
    [attachments],
  );
  const remoteTrainingCertificate = useMemo(
    () =>
      attachments?.find(
        (attachment) => attachment?.type === "TRAINING_CERTIFICATE",
      )?.file,
    [attachments],
  );
  const remoteAdditionalFiles = useMemo(
    () =>
      (attachments || [])
        .filter((attachment) => attachment?.type === "ADDITIONAL")
        .map((attachment) => ({ id: v4(), file: attachment?.file })),
    [attachments],
  );

  const [additionalFiles, setAdditionalFiles] = useState<
    { id: string; file: GQLFile | undefined }[]
  >([]);

  const resetAdditionalFiles = useCallback(() => {
    setAdditionalFiles([...remoteAdditionalFiles]);
  }, [remoteAdditionalFiles]);

  useEffect(() => {
    resetAdditionalFiles();
  }, [resetAdditionalFiles]);

  const {
    register,
    handleSubmit,
    resetField,
    control,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      idCard: undefined,
      equivalenceOrExemptionProof: undefined,
      trainingCertificate: undefined,
      additionalFiles: [],
    },
  });

  const handleFormSubmit = async (data: FormData) => {
    const idCard = data.idCard?.[0];
    const equivalenceOrExemptionProof = data.equivalenceOrExemptionProof?.[0];
    const trainingCertificate = data.trainingCertificate?.[0];
    const additionalFiles = data.additionalFiles
      .filter((file) => Boolean(file?.[0]))
      .map((file) => file[0]);

    const input = {
      idCard,
      equivalenceOrExemptionProof,
      trainingCertificate,
      additionalFiles,
    };

    try {
      const result = await urqlClient.mutation(createOrUpdateAttachments, {
        input,
        candidacyId,
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

  const resetForm = useCallback(() => {
    resetField("idCard");
    resetField("equivalenceOrExemptionProof");
    resetField("trainingCertificate");

    for (let index = 0; index < additionalFiles.length; index++) {
      resetField(`additionalFiles.${index}`);
    }

    resetAdditionalFiles();
  }, [additionalFiles.length, resetAdditionalFiles, resetField]);

  const idCardDefaultFile = useMemo(
    () => getFancyDefaultFile(remoteIdCard),
    [remoteIdCard],
  );

  const equivalenceOrExemptionProofDefaultFile = useMemo(
    () => getFancyDefaultFile(remoteEquivalenceOrExemptionProof),
    [remoteEquivalenceOrExemptionProof],
  );

  const trainingCertificateDefaultFile = useMemo(
    () => getFancyDefaultFile(remoteTrainingCertificate),
    [remoteTrainingCertificate],
  );

  const additionalFilesDefaultFile = useMemo(
    () =>
      remoteAdditionalFiles.map((additionalFile) => ({
        id: additionalFile.id,
        file: getFancyDefaultFile(additionalFile.file),
      })),
    [remoteAdditionalFiles],
  );

  const { remove } = useFieldArray({
    control,
    name: "additionalFiles",
  });

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
            defaultFile={idCardDefaultFile}
            nativeInputProps={{
              required: true,
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
            defaultFile={equivalenceOrExemptionProofDefaultFile}
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
            description="Attestation ou certificat de suivi de formation justifiant du prérequis demandé par la certification visée."
            hint="Formats supportés : jpg, png, pdf avec un poids maximum de 2Mo"
            defaultFile={trainingCertificateDefaultFile}
            nativeInputProps={{
              ...register("trainingCertificate"),
              accept: ".pdf, .jpg, .jpeg, .png",
            }}
            state={errors.trainingCertificate ? "error" : "default"}
            stateRelatedMessage={errors.trainingCertificate?.[0]?.message}
          />
          {additionalFiles.map((additionalFile, index) => (
            <FancyUpload
              key={additionalFile.id}
              className="col-span-2"
              title="Pièce jointe supplémentaire"
              description=""
              hint="Formats supportés : jpg, png, pdf avec un poids maximum de 2Mo"
              onClickDelete={() => {
                remove(index);

                setAdditionalFiles(
                  additionalFiles.filter(
                    (file) => file.id != additionalFile.id,
                  ),
                );
              }}
              defaultFile={
                additionalFilesDefaultFile.find(
                  (file) => file.id == additionalFile.id,
                )?.file
              }
              nativeInputProps={{
                ...register(`additionalFiles.${index}`),
                accept: ".pdf, .jpg, .jpeg, .png",
              }}
              state={errors.additionalFiles?.[index] ? "error" : "default"}
              stateRelatedMessage={errors.additionalFiles?.[index]?.message}
            />
          ))}
          {additionalFiles?.length < MAX_ADDITIONAL_FILES && (
            <div
              className="flex cursor-pointer gap-2 text-blue-900 items-center w-fit"
              onClick={() => {
                setAdditionalFiles((prev) => [
                  ...prev,
                  { id: v4(), file: undefined },
                ]);
              }}
            >
              <span className="fr-icon-add-line fr-icon--sm" />
              <span className="text-sm">Ajouter une pièce jointe</span>
            </div>
          )}
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

const getFancyDefaultFile = (file?: GQLFile) =>
  file?.previewUrl
    ? {
        name: file.name,
        mimeType: file.mimeType,
        url: file.previewUrl,
      }
    : undefined;
