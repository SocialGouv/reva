"use client";
import { FancyUpload } from "@/components/fancy-upload/FancyUpload";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { useUrqlClient } from "@/components/urql-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  createOrUpdateAttachments,
  useAttachments,
} from "./_components/attachments.hook";

const schema = z
  .object({
    idCard: z.object({
      0: z.instanceof(File, { message: "Ce champ est obligatoire" }),
    }),
    equivalanceOrExemptionProof: z
      .object({
        0: z.undefined().or(z.instanceof(File)),
      })
      .optional(),
    trainingCertificate: z
      .object({
        0: z.undefined().or(z.instanceof(File)),
      })
      .optional(),
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

  const defaultValues = useMemo(
    () => ({
      idCard: undefined,
      equivalanceOrExemptionProof: undefined,
      trainingCertificate: undefined,
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
    const input = {
      candidacyId,
      idCard: data.idCard[0],
      equivalanceOrExemptionProof: data.equivalanceOrExemptionProof?.[0],
      trainingCertificate: data.trainingCertificate?.[0],
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
            hint="Format supporté : PDF uniquement avec un poids maximum de 2Mo"
            nativeInputProps={{
              ...register("idCard"),
              accept: ".pdf",
            }}
            state={errors.idCard ? "error" : "default"}
            stateRelatedMessage={errors.idCard?.[0]?.message}
          />
          {attachments?.find((attachment) => attachment?.type === "ID_CARD")
            ?.file && (
            <iframe
              className="w-full h-[500px]"
              title="Pièce d'identité"
              name="Pièce d'identité"
              src={
                attachments.find((attachment) => attachment?.type === "ID_CARD")
                  ?.file.previewUrl || ""
              }
            />
          )}
          <FancyUpload
            className="col-span-2"
            title="Justificatif d'équivalence ou de dispense (optionnel)"
            description="Copie du ou des justificatifs ouvrant accès à une équivalence ou dispense en lien avec la certification visée."
            hint="Format supporté : PDF uniquement avec un poids maximum de 2Mo"
            nativeInputProps={{
              ...register("equivalanceOrExemptionProof"),
              accept: ".pdf",
            }}
            state={errors.equivalanceOrExemptionProof ? "error" : "default"}
            stateRelatedMessage={
              errors.equivalanceOrExemptionProof?.[0]?.message
            }
          />
          {attachments?.find(
            (attachment) =>
              attachment?.type === "EQUIVALENCE_OR_EXEMPTION_PROOF",
          )?.file && (
            <iframe
              className="w-full h-[500px]"
              title="Justificatif d'équivalence ou de dispense"
              name="Justificatif d'équivalence ou de dispense"
              src={
                attachments.find(
                  (attachment) =>
                    attachment?.type === "EQUIVALENCE_OR_EXEMPTION_PROOF",
                )?.file.previewUrl || ""
              }
            />
          )}
          <FancyUpload
            className="col-span-2"
            title="Attestation ou certificat de formation (optionnel)"
            description="Attestation ou certificat de suivi de formation justifiant du pré-requis demandé par la certification visée."
            hint="Format supporté : PDF uniquement avec un poids maximum de 2Mo"
            nativeInputProps={{
              ...register("trainingCertificate"),
              accept: ".pdf",
            }}
            state={errors.trainingCertificate ? "error" : "default"}
            stateRelatedMessage={errors.trainingCertificate?.[0]?.message}
          />
          {attachments?.find(
            (attachment) => attachment?.type === "TRAINING_CERTIFICATE",
          )?.file && (
            <iframe
              className="w-full h-[500px]"
              title="Attestation ou certificat de formation"
              name="Attestation ou certificat de formation"
              src={
                attachments.find(
                  (attachment) => attachment?.type === "TRAINING_CERTIFICATE",
                )?.file.previewUrl || ""
              }
            />
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
