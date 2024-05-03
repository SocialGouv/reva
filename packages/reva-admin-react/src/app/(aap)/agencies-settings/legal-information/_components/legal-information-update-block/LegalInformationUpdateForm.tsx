import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { CallOut } from "@codegouvfr/react-dsfr/CallOut";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { DetailedHTMLProps, InputHTMLAttributes, ReactNode } from "react";

const schema = z.object({
  managerFirstname: z.string(),
  managerLastname: z.string(),
  attestationURSSAF: z.any(),
  justificatifIdentiteGestionnaire: z.any(),
  delegataire: z.boolean(),
  lettreDeDelegation: z.any().optional(),
  justificatifIdentiteDelegataire: z.any(),
});

type FormData = z.infer<typeof schema>;

export const LegalInformationUpdateForm = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { isDirty, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { delegataire } = useWatch({ control });

  const handleFormSubmit = handleSubmit((data) => {
    console.log({ data });
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
