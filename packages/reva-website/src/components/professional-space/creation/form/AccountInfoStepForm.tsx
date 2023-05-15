import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useProfessionalSpaceCreationContext } from "../context/ProfessionalSpaceCreationContext";
import { useState } from "react";
import { FormOptionalFieldsDisclaimer } from "@/components/form/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";

const zodSchema = z.object({
  accountFirstname: z.string().min(1, "obligatoire"),
  accountLastname: z.string().min(1, "obligatoire"),
  accountEmail: z.string().email("mauvais format"),
  accountPhoneNumber: z.string().min(1, "obligatoire"),
});

type AccountInfoStepFormSchema = z.infer<typeof zodSchema>;

export const AccountInfoStepForm = () => {
  const [submissionError, setSubmissionError] = useState(false);
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
      setSubmissionError(false);
      await submitAccountInfoStep(data);
    } catch (e) {
      console.log(e);
      setSubmissionError(true);
    }
  };

  return (
    <div className="flex flex-col min-w-[70vw]">
      <Stepper
        title="Saisir vos informations générales"
        currentStep={4}
        stepCount={4}
      />
      <div className="border-t border-gray-300  mb-7" />
      {submissionError && (
        <div className="fr-message--error mb-6">
          Erreur lors de l'envoi du formulaire
        </div>
      )}
      <FormOptionalFieldsDisclaimer className="mb-6" />
      <form className="flex flex-col" onSubmit={handleSubmit(handleFormSubmit)}>
        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <legend className="text-xl font-bold text-gray-900 grow mb-4">
            Informations générales
          </legend>
          <Input
            label="Prénom"
            state={errors.accountFirstname ? "error" : "default"}
            stateRelatedMessage={errors.accountFirstname?.message}
            nativeInputProps={{
              ...register("accountFirstname"),
              autoComplete: "given-name",
            }}
          />
          <Input
            label="Nom"
            state={errors.accountLastname ? "error" : "default"}
            stateRelatedMessage={errors.accountLastname?.message}
            nativeInputProps={{
              ...register("accountLastname"),
              autoComplete: "family-name",
            }}
          />
          <Input
            label="Adresse email de l'architecte de parcours"
            state={errors.accountEmail ? "error" : "default"}
            stateRelatedMessage={errors.accountEmail?.message}
            nativeInputProps={{
              ...register("accountEmail"),
              autoComplete: "email",
              type: "email",
              spellCheck: "false",
            }}
          />
          <Input
            label="Téléphone de l'architecte de parcours"
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
