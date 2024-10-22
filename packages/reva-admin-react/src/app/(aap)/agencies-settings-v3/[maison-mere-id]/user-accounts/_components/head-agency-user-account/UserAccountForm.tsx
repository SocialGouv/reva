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
  defaultValues,
  remoteAgency,
  onSiteAgencies,
  backUrl,
}: {
  onSubmit(data: UserAccountFormData): Promise<void>;
  remoteAgency: { id: string; label: string };
  onSiteAgencies: { id: string; label: string }[];
  defaultValues?: UserAccountFormData;
  backUrl: string;
}) => {
  const methods = useForm<UserAccountFormData>({
    resolver: zodResolver(userAccountFormSchema),
    defaultValues: defaultValues || {
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
    reset(
      defaultValues || {
        modalitesAccompagnement: "REMOTE",
        organismId: remoteAgency.id,
      },
    );
  }, [defaultValues, remoteAgency.id, reset]);

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
    <>
      <p className="mb-10 text-xl">
        Le collaborateur ajouté recevra un mail pour finaliser son compte. Il
        pourra compléter et modifier les informations qui seront affichées aux
        candidats depuis son compte.
      </p>
      <form
        className="flex flex-col gap-8"
        onSubmit={handleFormSubmit}
        onReset={(e) => {
          e.preventDefault();
          handleReset();
        }}
      >
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
          <div className="col-span-1">
            <Input
              label="Email de connexion"
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
          <legend>
            <h2>Modalités d'accompagnement</h2>
          </legend>
          <RadioButtons
            classes={{ content: "grid grid-cols-1 md:grid-cols-2" }}
            orientation="horizontal"
            disabled={onSiteAgencies.length == 0}
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
            label="Choix du lieu d’accueil associé à l’accompagnement en présentiel :"
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
        <FormButtons formState={formState} backUrl={backUrl} />
      </form>
    </>
  );
};
