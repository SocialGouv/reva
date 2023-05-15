import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useController, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useProfessionalSpaceCreationContext } from "../context/ProfessionalSpaceCreationContext";
import { FormOptionalFieldsDisclaimer } from "@/components/form/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import Select from "@codegouvfr/react-dsfr/Select";
import { useCallback } from "react";
import { MultiSelect } from "@/components/form/multi-select/MultiSelect";
import { Notice } from "@codegouvfr/react-dsfr/Notice";

const zodSchema = z.object({
  typology: z.enum(["generaliste", "expertFiliere", "expertBranche"]),
  domaineIds: z.string().array(),
  ccnIds: z.string().array(),
  onSiteDepartmentsIds: z.string().array(),
  remoteDepartmentsIds: z.string().array(),
});

type CertificationsInfoStepFormSchema = z.infer<typeof zodSchema>;

export const CertificationsInfoStepForm = ({
  availableDomaines,
  availableConventions,
  availableDepartments,
}: {
  availableDomaines: { label: string; id: string }[];
  availableConventions: { label: string; code: string; id: string }[];
  availableDepartments: { label: string; code: string; id: string }[];
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

  const onSiteDepartmentsController = useController({
    name: "onSiteDepartmentsIds",
    defaultValue: [],
    control,
    rules: { required: true },
  });

  const remoteDepartmentsController = useController({
    name: "remoteDepartmentsIds",
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
        title="Identifier les certifications qui vous concernent"
        nextTitle="Saisir les informations pour la facturation"
        currentStep={3}
        stepCount={4}
      />
      <div className="border-t border-gray-300  mb-7" />
      <FormOptionalFieldsDisclaimer className="mb-6" />
      <form className="flex flex-col" onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <fieldset className="flex flex-col">
            <legend className="text-xl font-bold text-gray-900 grow mb-4">
              Informations sur la typologie
            </legend>
            <Select
              label="Typologie d’Architecte Accompagnateur de Parcours"
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
            {(!currentTypology || currentTypology === "generaliste") && (
              <Notice title="En tant qu'Architecte Accompagnateur de Parcours généraliste, votre offre de service couvre toutes les certifications hormis celles rattachées aux conventions collectives." />
            )}
            {currentTypology === "expertFiliere" && (
              <MultiSelect
                label="Filière(s)"
                hint="Vous pouvez cocher plusieurs choix, avec un minimum d’une filière"
                withSelectAll
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
                  .map((d) => d.id)}
                onChange={domaineIdsController.field.onChange}
              />
            )}
            {currentTypology === "expertBranche" && (
              <>
                <Notice
                  className="mb-4"
                  title="En tant qu’Architecte Accompagnateur de Parcours expert de branche(s), votre offre de service couvre l'ensemble des certifications rattachées aux conventions collectives sélectionnées."
                />
                <MultiSelect
                  label="Conventions collectives auxquelles vous êtes rattaché"
                  hint="Vous pouvez cocher plusieurs conventions collectives"
                  withSelectAll
                  options={availableConventions.map((availableConvention) => ({
                    label: `${availableConvention.code} ${availableConvention.label}`,
                    value: availableConvention.id,
                  }))}
                  placeholder={(selectedItemsCount) =>
                    selectedItemsCount
                      ? `${selectedItemsCount} conventions collectives séléctionnées`
                      : "Cochez les conventions collectives concernées"
                  }
                  initialSelectedValues={availableConventions
                    .filter((ad) =>
                      ccnIdsController.field.value.includes(ad.id)
                    )
                    .map((d) => d.id)}
                  onChange={ccnIdsController.field.onChange}
                />
              </>
            )}
          </fieldset>
          <fieldset className="flex flex-col md:mb-12">
            <legend className="text-xl font-bold text-gray-900 grow mb-4">
              Choix de la zone d'intervention
            </legend>
            <MultiSelect
              label="Zone d’intervention en présentiel"
              hint="Cochez les départements couverts en présentiel"
              withSelectAll
              options={availableDepartments.map((department) => ({
                label: `${department.label} (${department.code})`,
                value: department.id,
              }))}
              placeholder={(selectedItemsCount) =>
                selectedItemsCount
                  ? `${selectedItemsCount} départements séléctionnés`
                  : "Cochez les départements concernés"
              }
              initialSelectedValues={availableDepartments
                .filter((ad) =>
                  onSiteDepartmentsController.field.value.includes(ad.id)
                )
                .map((d) => d.id)}
              onChange={onSiteDepartmentsController.field.onChange}
            />
            <MultiSelect
              label="Zone d’intervention en distanciel"
              hint="Cochez les départements couverts en distanciel"
              withSelectAll
              options={availableDepartments.map((department) => ({
                label: `${department.label} (${department.code})`,
                value: department.id,
              }))}
              placeholder={(selectedItemsCount) =>
                selectedItemsCount
                  ? `${selectedItemsCount} départements séléctionnés`
                  : "Cochez les départements concernés"
              }
              initialSelectedValues={availableDepartments
                .filter((ad) =>
                  remoteDepartmentsController.field.value.includes(ad.id)
                )
                .map((d) => d.id)}
              onChange={remoteDepartmentsController.field.onChange}
            />
          </fieldset>
        </div>
        <div className="flex gap-2 ml-auto mt-4">
          <Button priority="secondary" onClick={goBackToPreviousStep}>
            Revenir à l'étape 2
          </Button>
          <Button type="submit"> Passer à l'étape 4</Button>
        </div>
      </form>
    </div>
  );
};
