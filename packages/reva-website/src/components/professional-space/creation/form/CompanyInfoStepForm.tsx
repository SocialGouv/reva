import { FormOptionalFieldsDisclaimer } from "@/components/form/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { zodResolver } from "@hookform/resolvers/zod";
import { useController, useForm } from "react-hook-form";
import * as z from "zod";

import { useProfessionalSpaceCreationContext } from "../context/ProfessionalSpaceCreationContext";

const legalStatuses = [
  "ASSOCIATION_LOI_1901",
  "EI",
  "EIRL",
  "ETABLISSEMENT_PUBLIC",
  "EURL",
  "SA",
  "SARL",
  "SAS",
  "SASU",
] as const;

const legalStatusLabel = (legalStatus: typeof legalStatuses[number]) => {
  let label = legalStatus.toString();
  switch (legalStatus) {
    case "ASSOCIATION_LOI_1901":
      label = "Association loi 1901";
      break;
    case "ETABLISSEMENT_PUBLIC":
      label = "Établissement public (EPIC…)";
      break;
  }
  return label;
};

const zodSchema = z.object({
  companySiret: z.string().length(14, "doit comporter 14 caractères"),
  companyLegalStatus: z.enum(legalStatuses, {
    required_error: "obligatoire",
  }),
  companyName: z.string().min(1, "obligatoire"),
  companyAddress: z.string().min(1, "obligatoire"),
  companyZipCode: z
    .string()
    .min(1, "obligatoire")
    .max(5, "doit comporter 5 chiffres"),
  companyCity: z.string().min(1, "obligatoire"),
  companyWebsite: z.union([z.literal(""), z.string().url()]),
});

type CompanyInfoStepFormSchema = z.infer<typeof zodSchema>;

export const CompanyInfoStepForm = () => {
  const {
    professionalSpaceInfos,
    submitCompanyInfoStep,
    goBackToPreviousStep,
  } = useProfessionalSpaceCreationContext();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CompanyInfoStepFormSchema>({
    resolver: zodResolver(zodSchema),
    defaultValues: { ...professionalSpaceInfos },
  });

  const companyLegalStatusController = useController({
    name: "companyLegalStatus",
    control,
  });

  const handleFormSubmit = (data: CompanyInfoStepFormSchema) =>
    submitCompanyInfoStep(data);

  return (
    <div className="flex flex-col min-w-[70vw]">
      <Stepper
        title="Saisir vos informations pour l'établissement"
        currentStep={3}
        stepCount={5}
        nextTitle="Identifier les certifications qui vous concernent"
      />
      <div className="border-t border-gray-300  mb-7" />
      <FormOptionalFieldsDisclaimer className="mb-6" />
      <form className="flex flex-col" onSubmit={handleSubmit(handleFormSubmit)}>
        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <legend className="text-xl font-bold text-gray-900 grow mb-4">
            Informations juridiques de l'établissement
          </legend>
          <Input
            label="SIRET de l'établissement"
            hintText="Format attendu : 14 chiffres"
            state={errors.companySiret ? "error" : "default"}
            stateRelatedMessage={errors.companySiret?.message}
            nativeInputProps={{ ...register("companySiret") }}
          />
          <Select
            label="Forme juridique"
            hint="Sélectionnez la forme juridique de l'établissement"
            state={errors.companyLegalStatus ? "error" : "default"}
            stateRelatedMessage={errors.companyLegalStatus?.message}
            nativeSelectProps={{
              value: companyLegalStatusController.field.value,
              onChange: companyLegalStatusController.field.onChange,
            }}
          >
            {!companyLegalStatusController.field.value && (
              <option value={undefined} />
            )}
            {legalStatuses.map((ls) => (
              <option key={ls} value={ls}>
                {legalStatusLabel(ls)}
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
          <Input
            label="Site internet de l'établissement (optionnel)"
            state={errors.companyWebsite ? "error" : "default"}
            stateRelatedMessage={errors.companyWebsite?.message}
            nativeInputProps={{
              ...register("companyWebsite"),
              placeholder:
                "Copiez le lien du site internet de votre établissement",
              autoComplete: "url",
            }}
          />
        </fieldset>
        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-x-8 mt-8">
          <legend className="text-lg font-bold text-gray-900 grow my-4">
            Adresse de l' établissement
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
        <div className="flex gap-2 ml-auto mt-4">
          <Button priority="secondary" onClick={goBackToPreviousStep}>
            Revenir à l'étape 2
          </Button>
          <Button type="submit">Passer à l'étape 4</Button>
        </div>
      </form>
    </div>
  );
};
