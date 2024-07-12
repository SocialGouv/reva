import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { Input } from "@codegouvfr/react-dsfr/Input";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

import { z } from "zod";

export const userAccountFormSchema = z.object({
  firstname: z
    .string()
    .min(2, "Ce champ doit contenir au moins 2 caractères")
    .default(""),
  lastname: z
    .string()
    .min(2, "Ce champ doit contenir au moins 2 caractères")
    .default(""),
  email: z
    .string()
    .email("Le champ doit contenir une adresse email")
    .default(""),

  modalitesAccompagnement: z.enum(["ONSITE", "REMOTE"], {
    invalid_type_error: "Merci de remplir ce champ",
  }),
  organismId: z.string(),
});

export type UserAccountFormData = z.infer<typeof userAccountFormSchema>;

export const UserAccountForm = ({
  onSubmit,
  remoteAgency,
  onSiteAgencies,
}: {
  onSubmit(data: UserAccountFormData): Promise<void>;
  remoteAgency: { id: string; label: string };
  onSiteAgencies: { id: string; label: string }[];
}) => {
  const methods = useForm<UserAccountFormData>({
    resolver: zodResolver(userAccountFormSchema),
    defaultValues: {
      modalitesAccompagnement: "REMOTE",
      organismId: remoteAgency.id,
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState,
    formState: { errors },
  } = methods;

  const handleFormSubmit = handleSubmit(onSubmit);

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    handleReset();
  }, [handleReset]);

  const { modalitesAccompagnement } = useWatch({ control });

  const handleModaliteAccompagnementChange = (
    newModaliteAccompagnement: "REMOTE" | "ONSITE",
  ) => {
    setValue(
      "organismId",
      newModaliteAccompagnement === "REMOTE"
        ? remoteAgency.id
        : onSiteAgencies[0].id,
    );
  };

  return (
    <form
      className="flex flex-col gap-8"
      onSubmit={handleFormSubmit}
      onReset={(e) => {
        e.preventDefault();
        handleReset();
      }}
    >
      <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <legend className="text-3xl font-bold mb-4">
          Informations de connexion
        </legend>
        <Input
          label="Nom"
          state={errors.lastname ? "error" : "default"}
          stateRelatedMessage={errors.lastname?.message?.toString()}
          nativeInputProps={{
            ...register("lastname"),
            autoComplete: "family-name",
          }}
        />
        <Input
          label="Prénom"
          state={errors.firstname ? "error" : "default"}
          stateRelatedMessage={errors.firstname?.message?.toString()}
          nativeInputProps={{
            ...register("firstname"),
            autoComplete: "given-name",
          }}
        />
        <div className="col-span-2">
          <Input
            label="Adresse email"
            state={errors.email ? "error" : "default"}
            stateRelatedMessage={errors.email?.message?.toString()}
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
        <legend className="text-3xl font-bold mb-6">
          Modalités d'accompagnement
        </legend>
        <RadioButtons
          orientation="horizontal"
          options={[
            {
              label: "Accompagnement à distance",
              nativeInputProps: {
                value: "REMOTE",
                ...register("modalitesAccompagnement", {
                  onChange: (e) =>
                    handleModaliteAccompagnementChange(e.target.value),
                }),
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
          disabled={modalitesAccompagnement !== "ONSITE"}
          label="À quel lieu d’accueil sera-t-il rattaché ?"
          nativeSelectProps={{
            ...register("organismId"),
          }}
        >
          {modalitesAccompagnement === "REMOTE" ? (
            <option value={remoteAgency.id}>{remoteAgency.label}</option>
          ) : (
            onSiteAgencies.map((la) => (
              <option key={la.id} value={la.id}>
                {la.label}
              </option>
            ))
          )}
        </Select>
      </fieldset>
      <FormButtons formState={formState} />
    </form>
  );
};
