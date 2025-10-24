import { Input } from "@codegouvfr/react-dsfr/Input";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { sanitizedEmail, sanitizedText } from "@/utils/input-sanitization";

const userAccountFormSchema = z.object({
  firstname: sanitizedText({ minLength: 2 }),
  lastname: sanitizedText({ minLength: 2 }),
  email: sanitizedEmail(),

  modalitesAccompagnement: z.enum(["ONSITE", "REMOTE"], {
    invalid_type_error: "Merci de remplir ce champ",
  }),
  organismId: z.string(),
});

type UserAccountFormData = z.infer<typeof userAccountFormSchema>;

export const UserAccountForm = ({
  defaultValues,
  organism,
}: {
  organism: { id: string; label: string };
  defaultValues?: UserAccountFormData;
  emailFieldDisabled?: boolean;
}) => {
  const methods = useForm<UserAccountFormData>({
    resolver: zodResolver(userAccountFormSchema),
    defaultValues: defaultValues || {
      modalitesAccompagnement: "REMOTE",
      organismId: organism.id,
    },
  });

  const {
    register,
    formState: { errors, isDirty, isSubmitting },
  } = methods;

  return (
    <>
      <p className="mb-10 text-xl">
        Voici les informations liées à votre compte collaborateur. Si vous
        souhaitez les modifier, adressez-vous directement à l’administrateur du
        compte principal.
      </p>
      <form className="flex flex-col gap-8">
        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <legend>
            <h2>Informations de connexion</h2>
          </legend>
          <Input
            label="Nom"
            state={errors.lastname ? "error" : "default"}
            stateRelatedMessage={errors.lastname?.message?.toString()}
            nativeInputProps={{
              ...register("lastname"),
              autoComplete: "family-name",
            }}
            disabled
          />
          <Input
            label="Prénom"
            state={errors.firstname ? "error" : "default"}
            stateRelatedMessage={errors.firstname?.message?.toString()}
            nativeInputProps={{
              ...register("firstname"),
              autoComplete: "given-name",
            }}
            disabled
          />
          <div className="col-span-1">
            <Input
              label="Adresse électronique de connexion"
              state={errors.email ? "error" : "default"}
              stateRelatedMessage={errors.email?.message?.toString()}
              disabled
              nativeInputProps={{
                ...register("email"),
                autoComplete: "email",
                type: "email",
                spellCheck: "false",
              }}
            />
          </div>
        </fieldset>
        <fieldset className="flex flex-col w-full">
          <legend>
            <h2>Modalités d'accompagnement</h2>
          </legend>
          <RadioButtons
            classes={{ content: "grid grid-cols-1 md:grid-cols-2" }}
            orientation="horizontal"
            disabled
            options={[
              {
                label: "Accompagnement à distance",
                nativeInputProps: {
                  value: "REMOTE",
                  ...register("modalitesAccompagnement"),
                },
              },
              {
                label: "Accompagnement en présentiel",
                nativeInputProps: {
                  value: "ONSITE",
                  ...register("modalitesAccompagnement"),
                },
              },
            ]}
            state={errors.modalitesAccompagnement ? "error" : "default"}
            stateRelatedMessage={errors.modalitesAccompagnement?.message?.toString()}
          />
          <Select
            disabled
            label="Choix du lieu d’accueil associé à l’accompagnement en présentiel :"
            nativeSelectProps={{
              ...register("organismId"),
            }}
          >
            <option key={organism.id} value={organism.id}>
              {organism.label}
            </option>
          </Select>
        </fieldset>
        <FormButtons
          formState={{ isDirty, isSubmitting }}
          backUrl="/agencies-settings-v3"
        />
      </form>
    </>
  );
};
