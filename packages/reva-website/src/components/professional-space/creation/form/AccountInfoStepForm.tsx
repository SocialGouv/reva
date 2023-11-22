import { FormOptionalFieldsDisclaimer } from "@/components/form/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import Notice from "@codegouvfr/react-dsfr/Notice";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { useProfessionalSpaceCreationContext } from "../context/ProfessionalSpaceCreationContext";

const zodSchema = z.object({
  accountFirstname: z.string().min(1, "obligatoire"),
  accountLastname: z.string().min(1, "obligatoire"),
  accountEmail: z.string().email("mauvais format"),
  accountPhoneNumber: z.string().min(1, "obligatoire"),
});

type AccountInfoStepFormSchema = z.infer<typeof zodSchema>;

export const AccountInfoStepForm = () => {
  const [submissionError, setSubmissionError] = useState<string | undefined>(
    undefined
  );
  const {
    professionalSpaceInfos,
    goBackToPreviousStep,
    submitAccountInfoStep,
  } = useProfessionalSpaceCreationContext();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountInfoStepFormSchema>({
    resolver: zodResolver(zodSchema),
    defaultValues: { ...professionalSpaceInfos },
  });

  const handleFormSubmit = async (data: AccountInfoStepFormSchema) => {
    try {
      setSubmissionError(undefined);
      await submitAccountInfoStep(data);
    } catch (err: any) {
      console.log(err);
      setSubmissionError(
        (err?.response?.errors?.[0].message as string) ?? "erreur inconnue"
      );
    }
  };

  return (
    <div className="flex flex-col min-w-[70vw]">
      <Stepper
        title="Saisir vos informations de contact et de connexion du compte administrateur"
        currentStep={5}
        stepCount={5}
      />
      <div className="border-t border-gray-300  mb-7" />
      {submissionError && (
        <div className="fr-message--error mb-6">
          Erreur lors de l'envoi du formulaire: {submissionError}
        </div>
      )}
      <FormOptionalFieldsDisclaimer className="mb-6" />
      <form className="flex flex-col" onSubmit={handleSubmit(handleFormSubmit)}>
        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <legend className="text-xl font-bold text-gray-900 grow mb-4">
            Informations de contact et de connexion du compte administrateur
          </legend>
          <Input
            label="Prénom de l'administrateur du compte"
            state={errors.accountFirstname ? "error" : "default"}
            stateRelatedMessage={errors.accountFirstname?.message}
            nativeInputProps={{
              ...register("accountFirstname"),
              autoComplete: "given-name",
            }}
          />
          <Input
            label="Nom de l'administrateur du compte"
            state={errors.accountLastname ? "error" : "default"}
            stateRelatedMessage={errors.accountLastname?.message}
            nativeInputProps={{
              ...register("accountLastname"),
              autoComplete: "family-name",
            }}
          />
          <div className="flex flex-col">
            <Input
              label="Adresse email du compte administrateur"
              state={errors.accountEmail ? "error" : "default"}
              stateRelatedMessage={errors.accountEmail?.message}
              nativeInputProps={{
                ...register("accountEmail"),
                autoComplete: "email",
                type: "email",
                spellCheck: "false",
              }}
            />
            <Notice
              className="mb-4"
              title="Vous recevrez la confirmation de la validation de votre compte administrateur sur cet email. Il vous sera également nécessaire pour vous connecter à la plateforme."
            />
          </div>
          <Input
            label="Numéro de téléphone de l’administrateur du compte"
            state={errors.accountPhoneNumber ? "error" : "default"}
            stateRelatedMessage={errors.accountPhoneNumber?.message}
            nativeInputProps={{
              ...register("accountPhoneNumber"),
              autoComplete: "phone",
              type: "phone",
            }}
          />
        </fieldset>
        <div className="flex gap-2 ml-auto mt-4">
          <Button priority="secondary" onClick={goBackToPreviousStep}>
            Revenir à l'étape 4
          </Button>
          <Button type="submit">Valider le formulaire</Button>
        </div>
      </form>
    </div>
  );
};
