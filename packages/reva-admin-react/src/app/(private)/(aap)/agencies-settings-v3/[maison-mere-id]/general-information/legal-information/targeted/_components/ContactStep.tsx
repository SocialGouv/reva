import Alert from "@codegouvfr/react-dsfr/Alert";
import Input from "@codegouvfr/react-dsfr/Input";
import { UseFormReturn } from "react-hook-form";

import { GeneralInformationFormValues } from "../../../generalInformationPage.hook";

export const ContactStep = ({
  formHook: {
    register,
    formState: { errors },
  },
}: {
  formHook: UseFormReturn<GeneralInformationFormValues>;
}) => (
  <>
    <Alert
      className="mb-6"
      severity="info"
      small
      description="En cas de modification de l'adresse électronique de connexion, une notification sera envoyée sur l'ancienne adresse électronique."
    />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        label="Adresse électronique de connexion"
        nativeInputProps={register("gestionnaireEmail")}
        state={errors.gestionnaireEmail ? "error" : "default"}
        stateRelatedMessage={errors.gestionnaireEmail?.message}
      />
      <Input
        label="Téléphone"
        nativeInputProps={register("phone")}
        state={errors.phone ? "error" : "default"}
        stateRelatedMessage={errors.phone?.message}
      />
    </div>
  </>
);
