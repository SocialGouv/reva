import { FormOptionalFieldsDisclaimer } from "@/components/form/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { MultiSelect } from "@/components/form/multi-select/MultiSelect";
import { MultiSelectWithAllableSubset } from "@/components/form/multi-select/MultiSelectWithAllableSubset";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Notice } from "@codegouvfr/react-dsfr/Notice";
import Select from "@codegouvfr/react-dsfr/Select";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { useController, useForm, useWatch } from "react-hook-form";
import * as z from "zod";

import { useProfessionalSpaceCreationContext } from "../context/ProfessionalSpaceCreationContext";

const zodSchema = z
  .object({
    typology: z.enum(["generaliste", "expertFiliere", "expertBranche"]),
    domaineIds: z.string().array(),
    ccnIds: z.string().array(),
    onSiteDepartmentsIds: z.string().array(),
    remoteDepartmentsIds: z.string().array(),
  })
  .superRefine(({ typology, ccnIds, domaineIds }, { addIssue }) => {
    switch (typology) {
      case "expertFiliere":
        if (!domaineIds?.length) {
          addIssue({
            code: "custom",
            path: ["domaineIds"],
            message: "Vous devez choisir au moins un domaine",
          });
        }
        break;
      case "expertBranche":
        if (!ccnIds?.length) {
          addIssue({
            code: "custom",
            path: ["ccnIds"],
            message: "Vous devez choisir au moins une convention collective",
          });
        }
        break;
    }
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

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CertificationsInfoStepFormSchema>({
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
  });

  const ccnIdsController = useController({
    name: "ccnIds",
    defaultValue: [],
    control,
  });

  const onSiteDepartmentsController = useController({
    name: "onSiteDepartmentsIds",
    defaultValue: [],
    control,
  });

  const remoteDepartmentsController = useController({
    name: "remoteDepartmentsIds",
    defaultValue: [],
    control,
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
        currentStep={4}
        stepCount={5}
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
              hint="Les certifications vous sont rattachées en fonction de la typologie sélectionnée."
              nativeSelectProps={{
                onChange: (event) => handleTypologyChange(event.target.value),
                value: typologyController.field.value,
                "aria-label":
                  "Typologie d'Architecte Accompagnateur de Parcours, une liste déroulante apparaît à l'activation des options Expert de filière(s) et Expert de branche(s)",
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
              <>
                <Notice
                  className="mb-4"
                  title="En tant qu’Architecte Accompagnateur de Parcours expert de filière(s), votre offre de service couvre l'ensemble des certifications rattachées aux filières sélectionnées. Sur demande à notre service support@vae.gouv.fr , vous pourrez aussi accompagner les certifications rattachées aux conventions collectives de ces filières."
                />
                <MultiSelect
                  label="Filière(s)"
                  hint="Vous pouvez cocher plusieurs choix, avec un minimum d’une filière"
                  state={errors?.domaineIds ? "error" : "default"}
                  stateRelatedMessage={errors?.domaineIds?.message}
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
              </>
            )}
            {currentTypology === "expertBranche" && (
              <>
                <Notice
                  className="mb-4"
                  title="En tant qu’Architecte Accompagnateur de Parcours expert de branche(s), votre offre de service couvre l'ensemble des Certificats de Qualification professionnelle / Titres à visée professionnelle rattachés à une convention collective sélectionnée."
                />
                <MultiSelect
                  label="Conventions collectives auxquelles vous êtes rattaché"
                  hint="Vous pouvez cocher plusieurs conventions collectives"
                  state={errors?.ccnIds ? "error" : "default"}
                  stateRelatedMessage={errors?.ccnIds?.message}
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
            <MultiSelectWithAllableSubset
              label="Zone d’intervention en présentiel"
              hint="Cochez les départements couverts en présentiel"
              subsetLabel="toute la France métropolitaine"
              subsetRefList={availableDepartments
                .filter(
                  ({ code }) =>
                    !["971", "972", "973", "974", "976"].includes(code)
                )
                .map(({ code }) => code)}
              options={availableDepartments.map((department) => ({
                label: `${department.label} (${department.code})`,
                value: department.id,
                subref: department.code,
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
            <MultiSelectWithAllableSubset
              label="Zone d’intervention en distanciel"
              hint="Cochez les départements couverts en distanciel"
              subsetLabel="toute la France métropolitaine"
              subsetRefList={availableDepartments
                .filter(
                  ({ code }) =>
                    !["971", "972", "973", "974", "976"].includes(code)
                )
                .map(({ code }) => code)}
              options={availableDepartments.map((department) => ({
                label: `${department.label} (${department.code})`,
                value: department.id,
                subref: department.code,
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
            Revenir à l'étape 3
          </Button>
          <Button type="submit"> Passer à l'étape 5</Button>
        </div>
      </form>
    </div>
  );
};
