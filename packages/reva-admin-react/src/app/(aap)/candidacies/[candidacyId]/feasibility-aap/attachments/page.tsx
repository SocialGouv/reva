"use client";
import { FancyUpload } from "@/components/fancy-upload/FancyUpload";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { GRAPHQL_API_URL } from "@/config/config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Client, fetchExchange } from "urql";
import { z } from "zod";

const schema = z
  .object({
    managerFirstname: z.string().min(1, "Ce champ est obligatoire."),
    managerLastname: z.string().min(1, "Ce champ est obligatoire."),
    attestationURSSAF: z.object({
      0: z.instanceof(File, { message: "Ce champ est obligatoire" }),
    }),
    justificatifIdentiteDirigeant: z.object({
      0: z.instanceof(File, { message: "Ce champ est obligatoire" }),
    }),

    delegataire: z.boolean(),
    lettreDeDelegation: z
      .object({
        0: z.undefined().or(z.instanceof(File)),
      })
      .optional(),
    justificatifIdentiteDelegataire: z
      .object({
        0: z.undefined().or(z.instanceof(File)),
      })
      .optional(),
  })
  .superRefine(
    (
      { lettreDeDelegation, justificatifIdentiteDelegataire, delegataire },
      { addIssue },
    ) => {
      if (delegataire) {
        if (!lettreDeDelegation?.[0]) {
          addIssue({
            path: ["lettreDeDelegation[0]"],
            message: "Ce champ est obligatoire",
            code: z.ZodIssueCode.custom,
          });
        }
        if (!justificatifIdentiteDelegataire?.[0]) {
          addIssue({
            path: ["justificatifIdentiteDelegataire[0]"],
            message: "Ce champ est obligatoire",
            code: z.ZodIssueCode.custom,
          });
        }
      }
    },
  );

type FormData = z.infer<typeof schema>;

export default function AttachmentsPage() {
  const { candidacyId } = useParams();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleFormSubmit = () => {
    const client = new Client({
      url: GRAPHQL_API_URL,
      exchanges: [fetchExchange],
    });
  };

  return (
    <div className="flex flex-col">
      <h1>Pièces jointes</h1>
      <FormOptionalFieldsDisclaimer />
      <p className="text-xl mb-12">
        Ajoutez toutes les pièces jointes nécessaires à la validation du dossier
        de recevabilité. Si nécessaire, vous pouvez revenir sur cet espace pour
        les ajouter au fur et à mesure.
      </p>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="flex flex-col gap-8 mb-2">
          <FancyUpload
            className="col-span-2"
            title="Pièce d'identité"
            description="Copie d'une pièce d'identité en cours de validité (la photo et les informations doivent être nettes). Le candidat devra montrer cette pièce lors du passage devant jury et en aura besoin pour la délivrance éventuelle de la certification. Sont valables les cartes d'identité, les passeports et les cartes de séjour."
            hint="Format supporté : PDF uniquement avec un poids maximum de 2Mo"
            nativeInputProps={{
              ...register("attestationURSSAF"),
              accept: ".pdf",
            }}
            state={errors.attestationURSSAF ? "error" : "default"}
            stateRelatedMessage={errors.attestationURSSAF?.[0]?.message}
          />
          <FancyUpload
            className="col-span-2"
            title="Justificatif d'équivalence ou de dispense (optionnel)"
            description="Copie du ou des justificatifs ouvrant accès à une équivalence ou dispense en lien avec la certification visée."
            hint="Format supporté : PDF uniquement avec un poids maximum de 2Mo"
            nativeInputProps={{
              ...register("attestationURSSAF"),
              accept: ".pdf",
            }}
            state={errors.attestationURSSAF ? "error" : "default"}
            stateRelatedMessage={errors.attestationURSSAF?.[0]?.message}
          />
          <FancyUpload
            className="col-span-2"
            title="Attestation ou certificat de formation (optionnel)"
            description="Attestation ou certificat de suivi de formation justifiant du pré-requis demandé par la certification visée."
            hint="Format supporté : PDF uniquement avec un poids maximum de 2Mo"
            nativeInputProps={{
              ...register("attestationURSSAF"),
              accept: ".pdf",
            }}
            state={errors.attestationURSSAF ? "error" : "default"}
            stateRelatedMessage={errors.attestationURSSAF?.[0]?.message}
          />
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
