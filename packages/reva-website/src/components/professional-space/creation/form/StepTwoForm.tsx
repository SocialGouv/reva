import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useProfessionalSpaceCreationContext } from "../context/ProfessionalSpaceCreationContext";

const zodSchema = z.object({
  companyBillingContactFirstname: z.string().min(1, "obligatoire"),
  companyBillingContactLastname: z.string().min(1, "obligatoire"),
  companyBillingEmail: z.string().email("mauvais format"),
  companyBillingPhoneNumber: z.string().min(1, "obligatoire"),
  companyBic: z.string().length(8, "8 caractères"),
  companyIban: z
    .string()
    .min(1, "obligatoire")
    .max(34, "34 caractères maximum"),
});

type StepTwoFormSchema = z.infer<typeof zodSchema>;

export const StepTwoForm = () => {
  const { professionalSpaceInfos, goBackToPreviousStep, submitStepTwo } =
    useProfessionalSpaceCreationContext();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StepTwoFormSchema>({
    resolver: zodResolver(zodSchema),
    defaultValues: { ...professionalSpaceInfos },
  });

  const handleFormSubmit = (data: StepTwoFormSchema) => submitStepTwo(data);

  return (
    <div className="flex flex-col min-w-[70vw]">
      <Stepper
        title="Saisir vos informations pour la facturation"
        currentStep={2}
        stepCount={3}
        nextTitle="Saisir les informations générales"
      />
      <div className="border-t border-gray-300  mb-7" />
      <form className="flex flex-col" onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <Input
            label="Prénom du contact de facturation *"
            state={errors.companyBillingContactFirstname ? "error" : "default"}
            stateRelatedMessage={errors.companyBillingContactFirstname?.message}
            nativeInputProps={{ ...register("companyBillingContactFirstname") }}
          />
          <Input
            label="Nom du contact de facturation *"
            state={errors.companyBillingContactLastname ? "error" : "default"}
            stateRelatedMessage={errors.companyBillingContactLastname?.message}
            nativeInputProps={{ ...register("companyBillingContactLastname") }}
          />
          <Input
            label="Adresse email de facturation *"
            state={errors.companyBillingEmail ? "error" : "default"}
            stateRelatedMessage={errors.companyBillingEmail?.message}
            nativeInputProps={{ ...register("companyBillingEmail") }}
          />
          <Input
            label="Téléphone du contact de facturation *"
            state={errors.companyBillingPhoneNumber ? "error" : "default"}
            stateRelatedMessage={errors.companyBillingPhoneNumber?.message}
            nativeInputProps={{ ...register("companyBillingPhoneNumber") }}
          />
          <Input
            label="BIC *"
            state={errors.companyBic ? "error" : "default"}
            stateRelatedMessage={errors.companyBic?.message}
            nativeInputProps={{ ...register("companyBic") }}
          />
          <Input
            label="IBAN *"
            state={errors.companyIban ? "error" : "default"}
            stateRelatedMessage={errors.companyIban?.message}
            nativeInputProps={{ ...register("companyIban") }}
          />
        </div>
        <div className="flex gap-2 ml-auto mt-4">
          <Button priority="secondary" onClick={goBackToPreviousStep}>
            Précédent
          </Button>
          <Button type="submit">Suivant</Button>
        </div>
      </form>
    </div>
  );
};
