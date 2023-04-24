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
import { MultiSelect } from "@/components/form/multi-select/MultiSelect";

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

  const domaineIdsController = useController({
    name: "domaineIds",
    defaultValue: [],
    control,
    rules: { required: true },
  });

  const ccnIdsController = useController({
    name: "ccnIds",
    defaultValue: [],
    control,
    rules: { required: true },
  });

  const handleFormSubmit = (data: CertificationsInfoStepFormSchema) =>
    submitCertificationsInfoStep(data);

  const currentTypology = useWatch({ name: "typology", control });

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
            <MultiSelect
              label="Filière(s)"
              hint="Vous pouvez cocher plusieurs choix, avec un minimum d’une filière"
              options={availableDomaines.map((availableDomaine) => ({
                label: availableDomaine.label,
                value: availableDomaine.id,
              }))}
              placeholder={(selectedItemsCount) =>
                selectedItemsCount
                  ? `${selectedItemsCount} filières séléctionnées`
                  : "Cochez toutes les filières concernées"
              }
              initialSelectedValues={availableDomaines
                .filter((ad) =>
                  domaineIdsController.field.value.includes(ad.id)
                )
                .map((d) => ({ label: d.label, value: d.id }))}
              onChange={(selectedOptions) =>
                domaineIdsController.field.onChange(
                  selectedOptions.map((option) => option.value)
                )
              }
            />
          )}
          {currentTypology === "expertBranche" && (
            <MultiSelect
              label="Conventions collectives auxquelles vous êtes rattaché"
              hint="Vous pouvez cocher plusieurs conventions collectives"
              options={availableConventions.map((availableConvention) => ({
                label: availableConvention.label,
                value: availableConvention.id,
              }))}
              placeholder={(selectedItemsCount) =>
                selectedItemsCount
                  ? `${selectedItemsCount} conventions collectives séléctionnées`
                  : "Cochez les conventions collectives concernées"
              }
              initialSelectedValues={availableConventions
                .filter((ad) => ccnIdsController.field.value.includes(ad.id))
                .map((d) => ({ label: d.label, value: d.id }))}
              onChange={(selectedOptions) =>
                ccnIdsController.field.onChange(
                  selectedOptions.map((option) => option.value)
                )
              }
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
