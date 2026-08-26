import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import Input from "@codegouvfr/react-dsfr/Input";
import { UseFormReturn } from "react-hook-form";

import { GeneralInformationFormValues } from "../../../generalInformationPage.hook";

export const AdministratorStep = ({
  formHook: {
    register,
    getValues,
    setValue,
    formState: { errors },
  },
  isDifferentPerson,
  onIsDifferentPersonChange,
}: {
  formHook: UseFormReturn<GeneralInformationFormValues>;
  isDifferentPerson: boolean;
  onIsDifferentPersonChange: (isDifferentPerson: boolean) => void;
}) => (
  // mb-0 sur la case: sa marge de fieldset s'ajouterait à celle du gap.
  <div className="flex flex-col gap-4">
    <Checkbox
      small
      className="mb-0"
      options={[
        {
          label:
            "L'administrateur du compte France VAE et le dirigeant de la structure sont deux personnes différentes.",
          hintText:
            "L'administrateur du compte France VAE peut gérer l'ensemble des candidatures et des comptes collaborateurs.",
          nativeInputProps: {
            checked: isDifferentPerson,
            onChange: (e) => {
              onIsDifferentPersonChange(e.target.checked);

              if (!e.target.checked) {
                setValue(
                  "gestionnaireFirstname",
                  getValues("managerFirstname"),
                  {
                    shouldDirty: true,
                  },
                );
                setValue("gestionnaireLastname", getValues("managerLastname"), {
                  shouldDirty: true,
                });
              }
            },
          },
        },
      ]}
    />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Input
        label="Nom de l'administrateur"
        nativeInputProps={register("gestionnaireLastname")}
        disabled={!isDifferentPerson}
        state={errors.gestionnaireLastname ? "error" : "default"}
        stateRelatedMessage={errors.gestionnaireLastname?.message}
      />
      <Input
        label="Prénom(s) de l'administrateur"
        nativeInputProps={register("gestionnaireFirstname")}
        disabled={!isDifferentPerson}
        state={errors.gestionnaireFirstname ? "error" : "default"}
        stateRelatedMessage={errors.gestionnaireFirstname?.message}
      />
    </div>
  </div>
);
