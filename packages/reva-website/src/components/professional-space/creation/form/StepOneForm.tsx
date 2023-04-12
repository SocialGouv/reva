import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useForm, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useProfessionalSpaceCreationContext } from "../context/ProfessionalSpaceCreationContext";
import { FormOptionalFieldsDisclaimer } from "@/components/form/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";

const legalStatuses = ["EI", "EURL", "SARL", "SAS", "SASU", "SA"] as const;

const zodSchema = z.object({
  companySiret: z.string().length(14, "doit comporter 14 caractères"),
  companyLegalStatus: z.enum(legalStatuses),
  companyName: z.string().min(1, "obligatoire"),
  companyAddress: z.string().min(1, "obligatoire"),
  companyZipCode: z.string().min(1, "obligatoire").max(5, "doit comporter 5 chiffres"),
  companyCity: z.string().min(1, "obligatoire"),
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
        title="Saisir vos informations pour la structure"
        currentStep={1}
        stepCount={3}
        nextTitle="Saisir les informations pour la facturation"
      />
      <div className="border-t border-gray-300  mb-7" />
      <FormOptionalFieldsDisclaimer className="mb-6" />
      <form className="flex flex-col" onSubmit={handleSubmit(handleFormSubmit)}>
        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <legend className="text-xl font-bold text-gray-900 grow mb-4">
            Informations juridiques de la structure
          </legend>
          <Input
            label="SIRET de la structure"
            hintText="Format attendu : 14 chiffres"
            state={errors.companySiret ? "error" : "default"}
            stateRelatedMessage={errors.companySiret?.message}
            nativeInputProps={{ ...register("companySiret") }}
          />
          <Select
            label="Forme juridique"
            hint="Sélectionnez la forme juridique de la structure"
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
            label="Raison sociale"
            state={errors.companyName ? "error" : "default"}
            stateRelatedMessage={errors.companyName?.message}
            nativeInputProps={{
              ...register("companyName"),
              autoComplete: "organization",
            }}
          />
        </fieldset>
        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-x-8 mt-8">
          <legend className="text-lg font-bold text-gray-900 grow my-4">
            Adresse de la structure
          </legend>
          <Input
            label="Numéro et nom de rue"
            state={errors.companyAddress ? "error" : "default"}
            stateRelatedMessage={errors.companyAddress?.message}
            nativeInputProps={{
              ...register("companyAddress"),
              autoComplete: "street-address",
            }}
          />
          <Input
            label="Code postal"
            state={errors.companyZipCode ? "error" : "default"}
            stateRelatedMessage={errors.companyZipCode?.message}
            nativeInputProps={{
              ...register("companyZipCode"),
              autoComplete: "postal-code",
            }}
          />
          <Input
            label="Ville"
            state={errors.companyCity ? "error" : "default"}
            stateRelatedMessage={errors.companyCity?.message}
            nativeInputProps={{
              ...register("companyCity"),
              autoComplete: "address-level2",
            }}
          />
        </fieldset>
        <Button type="submit" className="ml-auto mt-4">
          Passer à l'étape 2
        </Button>
      </form>
    </div>
  );
};
