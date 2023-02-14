import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useForm, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useProfessionalSpaceCreationContext } from "../context/ProfessionalSpaceCreationContext";

const legalStatuses = ["EI", "EURL", "SARL", "SAS", "SASU", "SA"] as const;

const zodSchema = z.object({
  companySiret: z.string().length(14, "doit comporter 14 caractères"),
  companyAddress: z.string().min(1, "obligatoire"),
  companyName: z.string().min(1, "obligatoire"),
  companyBillingAddress: z.string().min(1, "obligatoire"),
  companyBillingEmail: z.string().email("mauvais format"),
  companyLegalStatus: z.enum(legalStatuses),
});

type StepOneFormSchema = z.infer<typeof zodSchema>;

export const StepOneForm = () => {
  const { professionalSpaceInfos, submitStepOne } =
    useProfessionalSpaceCreationContext();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<StepOneFormSchema>({
    resolver: zodResolver(zodSchema),
    defaultValues: { ...professionalSpaceInfos },
  });

  const companyLegalStatusController = useController({
    name: "companyLegalStatus",
    control,
  });

  const handleFormSubmit = (data: StepOneFormSchema) => submitStepOne(data);

  return (
    <div className="flex flex-col min-w-[70vw]">
      <Stepper
        title="Saisir les informations de votre structure"
        currentStep={1}
        stepCount={3}
        nextTitle="Saisir les informations du contact principal pour la structure"
      />
      <div className="border-t border-gray-300  mb-7" />
      <form className="flex flex-col" onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <Input
            label="SIRET *"
            state={errors.companySiret ? "error" : "default"}
            stateRelatedMessage={errors.companySiret?.message}
            nativeInputProps={{ ...register("companySiret") }}
          />
          <Input
            label="Adresse du siège social *"
            state={errors.companyAddress ? "error" : "default"}
            stateRelatedMessage={errors.companyAddress?.message}
            nativeInputProps={{ ...register("companyAddress") }}
          />
          <Input
            label="Raison sociale *"
            state={errors.companyName ? "error" : "default"}
            stateRelatedMessage={errors.companyName?.message}
            nativeInputProps={{ ...register("companyName") }}
          />
          <Select
            label="Forme juridique *"
            state={errors.companyLegalStatus ? "error" : "default"}
            stateRelatedMessage={errors.companyLegalStatus?.message}
            nativeSelectProps={{
              value: companyLegalStatusController.field.value,
              onChange: companyLegalStatusController.field.onChange,
            }}
          >
            {legalStatuses.map((ls) => (
              <option key={ls} value={ls}>
                {ls}
              </option>
            ))}
          </Select>
          <Input
            label="Adresse de facturation *"
            state={errors.companyBillingAddress ? "error" : "default"}
            stateRelatedMessage={errors.companyBillingAddress?.message}
            nativeInputProps={{ ...register("companyBillingAddress") }}
          />
          <Input
            label="Adresse email de facturation*"
            state={errors.companyBillingEmail ? "error" : "default"}
            stateRelatedMessage={errors.companyBillingEmail?.message}
            nativeInputProps={{ ...register("companyBillingEmail") }}
          />
        </div>
        <Button type="submit" className="ml-auto mt-4">
          Suivant
        </Button>
      </form>
    </div>
  );
};
