"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { v4 } from "uuid";
import { object, z } from "zod";

import { FancyUpload } from "@/components/fancy-upload/FancyUpload";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { useUrqlClient } from "@/components/urql-client";

import { File as GQLFile } from "@/graphql/generated/graphql";

import {
  createOrUpdateAttachments,
  useAttachments,
} from "./_components/attachments.hook";

const ACCEPTED_FILE_TYPES = ".pdf, .jpg, .jpeg, .png" as const;
const MAX_FILE_SIZE = "15Mo" as const;
const MAX_UPLOAD_SIZE = 15728640 as const; // 15Mo

const hintMessage = `Formats supportés : ${ACCEPTED_FILE_TYPES} avec un poids maximum de ${MAX_FILE_SIZE}`;

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
  .superRefine(
    (
      {
        idCard,
        equivalenceOrExemptionProof,
        trainingCertificate,
        additionalFiles,
      },
      { addIssue },
    ) => {
      if (!idCard?.[0]) {
        addIssue({
          path: ["idCard"],
          message: "Merci de remplir ce champ",
          code: z.ZodIssueCode.custom,
        });
      }
      if (idCard[0].size > MAX_UPLOAD_SIZE) {
        addIssue({
          path: ["idCard", 0],
          message: `Le fichier choisi est trop volumineux. Choisissez un fichier inférieur à ${MAX_FILE_SIZE}`,
          code: z.ZodIssueCode.custom,
        });
      }
      if (
        equivalenceOrExemptionProof &&
        equivalenceOrExemptionProof[0] &&
        equivalenceOrExemptionProof[0].size > MAX_UPLOAD_SIZE
      ) {
        addIssue({
          path: ["equivalenceOrExemptionProof", 0],
          message: `Le fichier choisi est trop volumineux. Choisissez un fichier inférieur à ${MAX_FILE_SIZE}`,
          code: z.ZodIssueCode.custom,
        });
      }
      if (
        trainingCertificate &&
        trainingCertificate[0] &&
        trainingCertificate[0].size > MAX_UPLOAD_SIZE
      ) {
        addIssue({
          path: ["trainingCertificate", 0],
          message: `Le fichier choisi est trop volumineux. Choisissez un fichier inférieur à ${MAX_FILE_SIZE}`,
          code: z.ZodIssueCode.custom,
        });
      }
      additionalFiles.forEach((file, index) => {
        if (file[0] && file[0].size > MAX_UPLOAD_SIZE) {
          addIssue({
            path: [`additionalFiles.${index}`, 0],
            message: `Le fichier choisi est trop volumineux. Choisissez un fichier inférieur à ${MAX_FILE_SIZE}`,
            code: z.ZodIssueCode.custom,
          });
        }
      });
    },
  );

type FormData = z.infer<typeof schema>;

const MAX_ADDITIONAL_FILES = 8;

export default function AttachmentsPage() {
  const router = useRouter();
  const urqlClient = useUrqlClient();

  const { candidacyId } = useParams() satisfies { candidacyId: string };
  const feasibilitySummaryUrl = `/candidacies/${candidacyId}/feasibility-aap`;
  const { attachments } = useAttachments();

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

  const {
    fields: additionalFilesFields,
    append: appendAdditionalFiles,
    remove: removeAdditionalFiles,
  } = useFieldArray({
    control,
    name: "additionalFiles",
  });

  const remoteFiles = useMemo(() => {
    return {
      idCard: attachments?.find((attachment) => attachment?.type === "ID_CARD")
        ?.file,
      equivalenceOrExemptionProof: attachments?.find(
        (attachment) => attachment?.type === "EQUIVALENCE_OR_EXEMPTION_PROOF",
      )?.file,
      trainingCertificate: attachments?.find(
        (attachment) => attachment?.type === "TRAINING_CERTIFICATE",
      )?.file,
      additionalFiles: (attachments || [])
        .filter((attachment) => attachment?.type === "ADDITIONAL")
        .map((attachment) => ({
          id: v4(),
          name: attachment?.file?.name,
          file: attachment?.file,
        })),
    };
  }, [attachments]);

  const defaultIdFile = useMemo(
    () => getFancyDefaultFile(remoteFiles.idCard),
    [remoteFiles.idCard],
  );

  const defaultEquivalenceOrExemptionProofFile = useMemo(
    () => getFancyDefaultFile(remoteFiles.equivalenceOrExemptionProof),
    [remoteFiles.equivalenceOrExemptionProof],
  );

  const defaultTrainingCertificateFile = useMemo(
    () => getFancyDefaultFile(remoteFiles.trainingCertificate),
    [remoteFiles.trainingCertificate],
  );

  const defaultAdditionalFiles = useMemo(() => {
    return additionalFilesFields.map((field) =>
      getFancyDefaultFile(
        remoteFiles.additionalFiles.find((file) => file.name === field[0]?.name)
          ?.file,
      ),
    );
  }, [additionalFilesFields, remoteFiles.additionalFiles]);

  const resetAdditionalFiles = useCallback(() => {
    additionalFilesFields.forEach(() => removeAdditionalFiles(0));
    if (remoteFiles.additionalFiles.length > 0) {
      remoteFiles.additionalFiles.forEach((file) => {
        appendAdditionalFiles({
          0: file.file
            ? new File([], file.file.name, { type: file.file.mimeType })
            : undefined,
        });
      });
    }
  }, [
    remoteFiles.additionalFiles,
    appendAdditionalFiles,
    additionalFilesFields,
    removeAdditionalFiles,
  ]);

  useEffect(() => {
    if (remoteFiles.additionalFiles.length > 0) {
      resetAdditionalFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteFiles.additionalFiles]);

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
      successToast("Les pièces jointes ont été enregistrées");
      router.push(feasibilitySummaryUrl);
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  const resetForm = useCallback(() => {
    resetField("idCard");
    resetField("equivalenceOrExemptionProof");
    resetField("trainingCertificate");
    resetAdditionalFiles();
  }, [resetAdditionalFiles, resetField]);

  return (
    <div className="flex flex-col">
      <h1>Pièces jointes</h1>
      <FormOptionalFieldsDisclaimer />
      <p className="text-xl mb-12">
        Ajoutez toutes les pièces jointes nécessaires à la validation du dossier
        de faisabilité. Si nécessaire, vous pouvez revenir sur cet espace pour
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
            description="Copie d'une pièce d'identité en cours de validité (la photo et les informations doivent être nettes). Le candidat devra montrer cette pièce lors du passage devant le jury et en aura besoin pour la délivrance éventuelle de la certification. Sont valables les cartes d'identité, les passeports et les cartes de séjour."
            hint={hintMessage}
            defaultFile={defaultIdFile}
            nativeInputProps={{
              required: true,
              ...register("idCard"),
              accept: ACCEPTED_FILE_TYPES,
            }}
            state={errors.idCard ? "error" : "default"}
            stateRelatedMessage={errors.idCard?.[0]?.message}
            dataTest="id-card-upload"
          />
          <FancyUpload
            className="col-span-2"
            title="Justificatif d'équivalence ou de dispense (optionnel)"
            description="Copie du ou des justificatifs ouvrant accès à une équivalence ou dispense en lien avec la certification visée."
            hint={hintMessage}
            defaultFile={defaultEquivalenceOrExemptionProofFile}
            nativeInputProps={{
              ...register("equivalenceOrExemptionProof"),
              accept: ACCEPTED_FILE_TYPES,
            }}
            state={errors.equivalenceOrExemptionProof ? "error" : "default"}
            stateRelatedMessage={
              errors.equivalenceOrExemptionProof?.[0]?.message
            }
            dataTest="equivalence-proof-upload"
          />
          <FancyUpload
            className="col-span-2"
            title="Attestation ou certificat de formation (optionnel)"
            description="Attestation ou certificat de suivi de formation justifiant du prérequis demandé par la certification visée."
            hint={hintMessage}
            defaultFile={defaultTrainingCertificateFile}
            nativeInputProps={{
              ...register("trainingCertificate"),
              accept: ACCEPTED_FILE_TYPES,
            }}
            state={errors.trainingCertificate ? "error" : "default"}
            stateRelatedMessage={errors.trainingCertificate?.[0]?.message}
            dataTest="training-certificate-upload"
          />
          {additionalFilesFields.map((field, index) => (
            <FancyUpload
              key={field.id}
              className="col-span-2"
              title="Pièce jointe supplémentaire"
              description=""
              hint={hintMessage}
              onClickDelete={() => {
                removeAdditionalFiles(index);
              }}
              defaultFile={defaultAdditionalFiles[index]}
              nativeInputProps={{
                ...register(`additionalFiles.${index}`),
                accept: ACCEPTED_FILE_TYPES,
              }}
              state={errors.additionalFiles?.[index] ? "error" : "default"}
              stateRelatedMessage={
                errors.additionalFiles?.[index]?.[0]?.message
              }
              dataTest={`additional-file-${index}`}
            />
          ))}
          {additionalFilesFields.length < MAX_ADDITIONAL_FILES && (
            <div
              className="flex cursor-pointer gap-2 text-blue-900 items-center w-fit"
              onClick={() => {
                appendAdditionalFiles({ 0: undefined });
              }}
              data-testid="add-additional-file-button"
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
