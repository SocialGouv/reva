import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { FormButtons } from "@/components/form/form-footer/FormButtons";

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
        <Upload
          className="col-span-2"
          label="Attestation URSSAF"
          hint="Format supporté : PDF uniquement avec un poids maximum de 2Mo"
          nativeInputProps={{ type: "file", ...register("attestationURSSAF") }}
        />
        <Upload
          className="col-span-2"
          label="Copie du justificatif d'identité du dirigeant"
          hint="Format supporté : PDF uniquement avec un poids maximum de 2Mo"
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
            <Upload
              className="col-span-2"
              label="Lettre de délégation"
              hint="Format supporté : PDF uniquement avec un poids maximum de 2Mo"
              nativeInputProps={{
                type: "file",
                ...register("lettreDeDelegation"),
              }}
            />
            <Upload
              className="col-span-2"
              label="Copie du justificatif d'identité du délégataire"
              hint="Format supporté : PDF uniquement avec un poids maximum de 2Mo"
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
