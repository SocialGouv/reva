import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useProfessionalSpaceCreationContext } from "../context/ProfessionalSpaceCreationContext";
import { useState } from "react";

const zodSchema = z.object({
  accountFirstname: z.string().min(1, "obligatoire"),
  accountLastname: z.string().min(1, "obligatoire"),
  accountEmail: z.string().email("mauvais format"),
  accountPhoneNumber: z.string().min(1, "obligatoire"),
});

type StepThreeFormSchema = z.infer<typeof zodSchema>;

export const StepThreeForm = () => {
  const [submissionError, setSubmissionError] = useState(false);
  const { professionalSpaceInfos, goBackToPreviousStep, submitStepThree } =
    useProfessionalSpaceCreationContext();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StepThreeFormSchema>({
    resolver: zodResolver(zodSchema),
    defaultValues: { ...professionalSpaceInfos },
  });

  const handleFormSubmit = async (data: StepThreeFormSchema) => {
    try {
      setSubmissionError(false);
      await submitStepThree(data);
    } catch (e) {
      console.log(e);
      setSubmissionError(true);
    }
  };

  return (
    <div className="flex flex-col min-w-[70vw]">
      <Stepper
        title="Saisir vos informations générales"
        currentStep={3}
        stepCount={3}
      />
      <div className="border-t border-gray-300  mb-7" />
      {submissionError && (
        <div className="fr-message--error mb-4">
          Erreur lors de l'envoi du formulaire
        </div>
      )}
      <form className="flex flex-col" onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <Input
            label="Prénom *"
            state={errors.accountFirstname ? "error" : "default"}
            stateRelatedMessage={errors.accountFirstname?.message}
            nativeInputProps={{ ...register("accountFirstname") }}
          />
          <Input
            label="Nom *"
            state={errors.accountLastname ? "error" : "default"}
            stateRelatedMessage={errors.accountLastname?.message}
            nativeInputProps={{ ...register("accountLastname") }}
          />
          <Input
            label="Adresse email de l'architete de parcours *"
            state={errors.accountEmail ? "error" : "default"}
            stateRelatedMessage={errors.accountEmail?.message}
            nativeInputProps={{ ...register("accountEmail") }}
          />
          <Input
            label="Téléphone de l'architecte de parcours *"
            state={errors.accountPhoneNumber ? "error" : "default"}
            stateRelatedMessage={errors.accountPhoneNumber?.message}
            nativeInputProps={{ ...register("accountPhoneNumber") }}
          />
        </div>
        <div className="flex gap-2 ml-auto mt-4">
          <Button priority="secondary" onClick={goBackToPreviousStep}>
            Précédent
          </Button>
          <Button type="submit">Valider</Button>
        </div>
      </form>
    </div>
  );
};
