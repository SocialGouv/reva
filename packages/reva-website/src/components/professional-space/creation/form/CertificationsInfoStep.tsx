import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useForm, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useProfessionalSpaceCreationContext } from "../context/ProfessionalSpaceCreationContext";
import { FormOptionalFieldsDisclaimer } from "@/components/form/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import Select from "@codegouvfr/react-dsfr/Select";

const zodSchema = z.object({
  typology: z.enum(["generaliste"]),
});

type CertificationsInfoStepFormSchema = z.infer<typeof zodSchema>;

export const CertificationsInfoStepForm = () => {
  const {
    professionalSpaceInfos,
    goBackToPreviousStep,
    submitCertificationsInfoStep,
  } = useProfessionalSpaceCreationContext();

  const { handleSubmit, control } = useForm<CertificationsInfoStepFormSchema>({
    resolver: zodResolver(zodSchema),
    defaultValues: { ...professionalSpaceInfos },
  });

  const typologyController = useController({
    name: "typology",
    defaultValue: "generaliste",
    control,
    rules: { required: true },
  });

  const handleFormSubmit = (data: CertificationsInfoStepFormSchema) =>
    submitCertificationsInfoStep(data);

  return (
    <div className="flex flex-col min-w-[70vw]">
      <Stepper
        title="Renseigner les certifications concernées"
        nextTitle="Saisir les informations pour la facturation"
        currentStep={2}
        stepCount={4}
      />
      <div className="border-t border-gray-300  mb-7" />
      <FormOptionalFieldsDisclaimer className="mb-6" />
      <form className="flex flex-col" onSubmit={handleSubmit(handleFormSubmit)}>
        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <legend className="text-xl font-bold text-gray-900 grow mb-4">
            Informations sur la typologie
          </legend>
          <Select
            label="Typologie d’Architecte Accompagnateur de Parcours (AAP)"
            hint="Les certifications vous sont rattachées en fonction de votre typologie d’AAP"
            nativeSelectProps={{
              onChange: (event) =>
                typologyController.field.onChange(event.target.value),
              value: typologyController.field.value,
            }}
          >
            <option value="generaliste">Généraliste</option>
          </Select>
        </fieldset>
        <div className="flex gap-2 ml-auto mt-4">
          <Button priority="secondary" onClick={goBackToPreviousStep}>
            Revenir à l'étape 1
          </Button>
          <Button type="submit"> Passer à l'étape 3</Button>
        </div>
      </form>
    </div>
  );
};
