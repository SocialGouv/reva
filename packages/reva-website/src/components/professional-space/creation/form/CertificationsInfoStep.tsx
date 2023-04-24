import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { useForm, useController, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useProfessionalSpaceCreationContext } from "../context/ProfessionalSpaceCreationContext";
import { FormOptionalFieldsDisclaimer } from "@/components/form/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import Select from "@codegouvfr/react-dsfr/Select";
import { useCallback } from "react";

const zodSchema = z.object({
  typology: z.enum(["generaliste", "expertFiliere", "expertBranche"]),
  domaineIds: z.string().array(),
  ccnIds: z.string().array(),
});

type CertificationsInfoStepFormSchema = z.infer<typeof zodSchema>;

export const CertificationsInfoStepForm = ({
  availableDomaines,
  availableConventions,
}: {
  availableDomaines: { label: string; id: string }[];
  availableConventions: { label: string; code: string; id: string }[];
}) => {
  const {
    professionalSpaceInfos,
    goBackToPreviousStep,
    submitCertificationsInfoStep,
  } = useProfessionalSpaceCreationContext();

  const { handleSubmit, control, setValue } =
    useForm<CertificationsInfoStepFormSchema>({
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

  const currentTypology = useWatch({ name: "typology", control });
  const currentDomaineIds = useWatch({ name: "domaineIds", control });
  const currentConventionIds = useWatch({ name: "ccnIds", control });

  const handleTypologyChange = useCallback(
    (newTypology: string) => {
      if (newTypology !== "expertFiliere") {
        setValue("domaineIds", []);
      }
      if (newTypology !== "expertBranche") {
        setValue("ccnIds", []);
      }
      typologyController.field.onChange(newTypology);
    },
    [setValue, typologyController.field]
  );

  const handleDomaineIdToggle = useCallback(
    (domaineId: string) => {
      const newDomaineIds = currentDomaineIds.includes(domaineId)
        ? currentDomaineIds.filter((cdi) => cdi !== domaineId)
        : [...currentDomaineIds, domaineId];
      setValue("domaineIds", newDomaineIds);
    },
    [currentDomaineIds, setValue]
  );

  const handleCcnIdToggle = useCallback(
    (ccnId: string) => {
      const newCcnIds = currentConventionIds.includes(ccnId)
        ? currentConventionIds.filter((ccid) => ccid !== ccnId)
        : [...currentConventionIds, ccnId];
      setValue("ccnIds", newCcnIds);
    },
    [currentConventionIds, setValue]
  );

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
        <fieldset className="flex-flex-col max-w-lg">
          <legend className="text-xl font-bold text-gray-900 grow mb-4">
            Informations sur la typologie
          </legend>
          <Select
            label="Typologie d’Architecte Accompagnateur de Parcours (AAP)"
            hint="Les certifications vous sont rattachées en fonction de votre typologie d’AAP"
            nativeSelectProps={{
              onChange: (event) => handleTypologyChange(event.target.value),
              value: typologyController.field.value,
            }}
          >
            <option value="generaliste">Généraliste</option>
            <option value="expertFiliere">Expert de filière(s)</option>
            <option value="expertBranche">Expert de branche(s)</option>
          </Select>
          {currentTypology === "expertFiliere" && (
            <Checkbox
              legend="Secteurs auxquels vous êtes rattaché"
              hintText="Vous pouvez cocher plusieurs choix, avec un minimum d’un secteur d’activité"
              options={availableDomaines.map((availableDomaine) => ({
                label: availableDomaine.label,
                nativeInputProps: {
                  name: availableDomaine.id,
                  value: availableDomaine.id,
                  checked: currentDomaineIds.includes(availableDomaine.id),
                  onChange: () => handleDomaineIdToggle(availableDomaine.id),
                },
              }))}
            />
          )}
          {currentTypology === "expertBranche" && (
            <Checkbox
              legend="Conventions collectives auxquelles vous êtes rattaché"
              hintText="Vous pouvez cocher plusieurs choix, avec un minimum d’une conventiopn collective"
              options={availableConventions.map((availableConvention) => ({
                label: `${availableConvention.code} ${availableConvention.label}`,
                nativeInputProps: {
                  name: availableConvention.id,
                  value: availableConvention.id,
                  checked: currentConventionIds.includes(
                    availableConvention.id
                  ),
                  onChange: () => handleCcnIdToggle(availableConvention.id),
                },
              }))}
            />
          )}
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
