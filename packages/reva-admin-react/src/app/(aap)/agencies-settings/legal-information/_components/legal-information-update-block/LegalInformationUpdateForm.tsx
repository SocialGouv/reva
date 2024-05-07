import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { CallOut } from "@codegouvfr/react-dsfr/CallOut";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { DetailedHTMLProps, InputHTMLAttributes, ReactNode } from "react";
import { REST_API_URL } from "@/config/config";
import { useKeycloakContext } from "@/components/auth/keycloakContext";
import { errorToast, successToast } from "@/components/toast/toast";

const schema = z.object({
  managerFirstname: z.string().min(1, "Ce champ est obligatoire."),
  managerLastname: z.string().min(1, "Ce champ est obligatoire."),
  attestationURSSAF: z.object({
    0: z.undefined().or(z.instanceof(File)),
  }),
  justificatifIdentiteGestionnaire: z
    .object({
      0: z.undefined().or(z.instanceof(File)),
    })
    .optional(),
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
});

type FormData = z.infer<typeof schema>;

export const LegalInformationUpdateForm = ({
  maisonMereAAPId,
}: {
  maisonMereAAPId: string;
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { delegataire } = useWatch({ control });
  const { accessToken } = useKeycloakContext();

  const handleFormSubmit = handleSubmit(async (data) => {
    const formData = new FormData();
    formData.append("managerFirstname", data.managerFirstname);
    formData.append("managerLastname", data.managerLastname);
    formData.append("delegataire", data.delegataire.toString());

    if (data.attestationURSSAF?.[0]) {
      formData.append("attestationURSSAF", data.attestationURSSAF?.[0]);
    }
    if (data.justificatifIdentiteGestionnaire?.[0]) {
      formData.append(
        "justificatifIdentiteGestionnaire",
        data.justificatifIdentiteGestionnaire?.[0],
      );
    }
    if (data.lettreDeDelegation?.[0]) {
      formData.append("lettreDeDelegation", data.lettreDeDelegation?.[0]);
    }
    if (data.justificatifIdentiteDelegataire?.[0]) {
      formData.append(
        "justificatifIdentiteDelegataire",
        data.justificatifIdentiteDelegataire?.[0],
      );
    }

    const result = await fetch(
      `${REST_API_URL}/maisonMereAAP/${maisonMereAAPId}/legal-information`,
      {
        method: "post",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      },
    );
    if (result.ok) {
      successToast("Modifications enregistrées");
    } else {
      errorToast(await result.text());
    }
  });

  return (
    <div className="flex flex-col">
      <h2>Informations du dirigeant</h2>
      <form
        className="grid grid-cols-2 gap-x-4 gap-y-8"
        onSubmit={handleFormSubmit}
      >
        <Input
          className="my-0"
          label="Prénom"
          nativeInputProps={{ ...register("managerFirstname") }}
          state={errors.managerFirstname ? "error" : "default"}
          stateRelatedMessage={errors.managerLastname?.message?.toString()}
        />
        <Input
          className="my-0"
          label="Nom"
          nativeInputProps={{ ...register("managerLastname") }}
        />

        <FancyUpload
          className="col-span-2"
          title="Attestation URSSAF"
          description="L’attestation URSSAF doit afficher le code de vérification -
         Exemples : attestation de vigilance, attestation fiscale."
          nativeInputProps={{ type: "file", ...register("attestationURSSAF") }}
        />
        <FancyUpload
          className="col-span-2"
          title="Copie du justificatif d'identité du dirigeant"
          description={
            <>
              Le dirigeant est la personne mentionnée sur l’attestation de
              vigilance. La pièce d’identité peut être une carte nationale
              d’identité en cours de validité ou périmé de moins de 5 ans
              (resto/verso) ou un passeport en cours de validité.
              <br />
              <strong>
                Veillez à ce que votre photocopie soit lisible, non tronquée,
                bien cadrée et y apporter la mention manuscrite « Certifiée
                conforme à l’original », datée et signée par le dirigeant.
              </strong>
            </>
          }
          nativeInputProps={{
            type: "file",
            ...register("justificatifIdentiteGestionnaire"),
          }}
        />

        <Checkbox
          className="col-span-2 mt-4 mb-0"
          options={[
            {
              label: "Je souhaite déclarer un délégataire",
              nativeInputProps: { ...register("delegataire") },
              hintText:
                "Lorsque l’administrateur du compte France VAE est différent du dirigeant.",
            },
          ]}
        />
        {delegataire && (
          <>
            <FancyUpload
              className="col-span-2"
              title="Lettre de délégation"
              description="Lettre de délégation de l'administration du compte FVAE signée par le dirigeant et le délégataire"
              nativeInputProps={{
                type: "file",
                ...register("lettreDeDelegation"),
              }}
            />

            <FancyUpload
              className="col-span-2"
              title="Copie du justificatif d'identité du délégataire"
              description={
                <>
                  La pièce d’identité peut être une carte nationale d’identité
                  en cours de validité ou périmé de moins de 5 ans (resto/verso)
                  ou un passeport en cours de validité.
                  <br />
                  <strong>
                    Veillez à ce que votre photocopie soit lisible, non
                    tronquée, bien cadrée.
                  </strong>
                </>
              }
              nativeInputProps={{
                type: "file",
                ...register("justificatifIdentiteDelegataire"),
              }}
            />
          </>
        )}
        <FormButtons
          formState={{ isDirty, isSubmitting }}
          className="col-span-2"
        />
      </form>
    </div>
  );
};

const FancyUpload = ({
  title,
  description,
  className,
  nativeInputProps,
}: {
  title: string;
  description: string | ReactNode;
  className?: string;
  nativeInputProps?: DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >;
}) => (
  <Upload
    className={`border bg-dsfr-light-neutral-grey-1000 p-8 ${className || ""}`}
    label={
      <>
        <span className="text-2xl font-bold">{title}</span>
        <CallOut
          className="ml-8 my-4 py-0 bg-transparent"
          classes={{
            text: "text-sm leading-6 ",
          }}
        >
          {description}
        </CallOut>
      </>
    }
    hint="Format supporté : PDF uniquement avec un poids maximum de 2Mo"
    nativeInputProps={nativeInputProps}
  />
);
