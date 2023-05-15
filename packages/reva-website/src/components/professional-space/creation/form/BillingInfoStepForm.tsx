import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useProfessionalSpaceCreationContext } from "../context/ProfessionalSpaceCreationContext";
import { FormOptionalFieldsDisclaimer } from "@/components/form/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";

const zodSchema = z.object({
  companyBillingContactFirstname: z.string().min(1, "obligatoire"),
  companyBillingContactLastname: z.string().min(1, "obligatoire"),
  companyBillingEmail: z.string().email("mauvais format"),
  companyBillingPhoneNumber: z.string().min(1, "obligatoire"),
});

type BillingInfoStepFormSchema = z.infer<typeof zodSchema>;

export const BillingInfoStepForm = () => {
  const {
    professionalSpaceInfos,
    goBackToPreviousStep,
    submitBillingInfoStep,
  } = useProfessionalSpaceCreationContext();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BillingInfoStepFormSchema>({
    resolver: zodResolver(zodSchema),
    defaultValues: { ...professionalSpaceInfos },
  });

  const handleFormSubmit = (data: BillingInfoStepFormSchema) =>
    submitBillingInfoStep(data);

  return (
    <div className="flex flex-col min-w-[70vw]">
      <Stepper
        title="Saisir vos informations pour la facturation"
        currentStep={4}
        stepCount={5}
        nextTitle="Saisir les informations générales"
      />
      <div className="border-t border-gray-300  mb-7" />
      <FormOptionalFieldsDisclaimer className="mb-6" />
      <form className="flex flex-col" onSubmit={handleSubmit(handleFormSubmit)}>
        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <legend className="text-xl font-bold text-gray-900 grow mb-4">
            Informations de facturation
          </legend>

          <Input
            label="Prénom du contact de facturation"
            state={errors.companyBillingContactFirstname ? "error" : "default"}
            stateRelatedMessage={errors.companyBillingContactFirstname?.message}
            nativeInputProps={{
              ...register("companyBillingContactFirstname"),
              autoComplete: "given-name",
            }}
          />
          <Input
            label="Nom du contact de facturation"
            state={errors.companyBillingContactLastname ? "error" : "default"}
            stateRelatedMessage={errors.companyBillingContactLastname?.message}
            nativeInputProps={{
              ...register("companyBillingContactLastname"),
              autoComplete: "family-name",
            }}
          />
          <Input
            label="Adresse email de facturation"
            state={errors.companyBillingEmail ? "error" : "default"}
            stateRelatedMessage={errors.companyBillingEmail?.message}
            nativeInputProps={{
              ...register("companyBillingEmail"),
              autoComplete: "email",
              type: "email",
              spellCheck: "false",
            }}
          />
          <Input
            label="Téléphone du contact de facturation"
            state={errors.companyBillingPhoneNumber ? "error" : "default"}
            stateRelatedMessage={errors.companyBillingPhoneNumber?.message}
            nativeInputProps={{
              ...register("companyBillingPhoneNumber"),
              autoComplete: "tel",
              type: "tel",
            }}
          />
        </fieldset>
        <div className="flex gap-2 ml-auto mt-4">
          <Button priority="secondary" onClick={goBackToPreviousStep}>
            Revenir à l'étape 3
          </Button>
          <Button type="submit"> Passer à l'étape 5</Button>
        </div>
      </form>
    </div>
  );
};
