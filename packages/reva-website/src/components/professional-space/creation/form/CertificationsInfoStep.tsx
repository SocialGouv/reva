import { FormOptionalFieldsDisclaimer } from "@/components/form/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import {
  MultiSelect,
  Option as MultiSelectOption,
} from "@/components/form/multi-select/MultiSelect";
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
    typology: z.enum(["expertFiliere", "expertBranche"]),
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
    defaultValue: "expertFiliere",
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

  // Domains
  const availableDomaineOptions: MultiSelectOption[] = availableDomaines.map(
    (availableDomaine) => ({
      label: availableDomaine.label,
      value: availableDomaine.id,
    })
  );

  const selectedDomaineOptions = availableDomaineOptions.filter((option) =>
    domaineIdsController.field.value.includes(option.value)
  );

  // Conventions
  const availableConventionOptions: MultiSelectOption[] =
    availableConventions.map((availableConvention) => ({
      label: `${availableConvention.code} ${availableConvention.label}`,
      value: availableConvention.id,
    }));

  const selectedConventionOptions = availableConventionOptions.filter(
    (option) => ccnIdsController.field.value.includes(option.value)
  );

  // Departments
  const availableDepartmentOptions: MultiSelectOption[] =
    availableDepartments.map((department) => ({
      label: `${department.label} (${department.code})`,
      value: department.id,
    }));

  const selectedOnSiteDepartmentOptions = availableDepartmentOptions.filter(
    (option) => onSiteDepartmentsController.field.value.includes(option.value)
  );

  const selectedRemoteDepartmentOptions = availableDepartmentOptions.filter(
    (option) => remoteDepartmentsController.field.value.includes(option.value)
  );

  const domTomDepartmentOptions = availableDepartments
    .filter(({ code }) => ["971", "972", "973", "974", "976"].includes(code))
    .map((department) => ({
      label: `${department.label} (${department.code})`,
      value: department.id,
    }));

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
              <option value="expertFiliere">Expert de filière(s)</option>
              <option value="expertBranche">Expert de branche(s)</option>
            </Select>
            {(!currentTypology || currentTypology === "expertFiliere") && (
              <>
                <Notice
                  className="mb-4"
                  title={
                    <>
                      <span>
                        En tant qu’Architecte Accompagnateur de Parcours expert
                        de filière(s), votre offre de service couvre l'ensemble
                        des certifications rattachées aux filières
                        sélectionnées. Sur demande à notre service
                        support@vae.gouv.fr , vous pourrez aussi accompagner les
                        certifications rattachées aux conventions collectives de
                        ces filières.
                      </span>
                      <br />
                      <a
                        href="https://airtable.com/shrTDCbwwBI4xLLo9/tblWDa9HN0cuqLnAl"
                        target="_blank"
                        title="Retrouvez l'ensemble des certifications vous concernant - nouvelle page"
                      >
                        Retrouvez l'ensemble des certifications vous concernant
                      </a>
                    </>
                  }
                />
                <MultiSelect
                  label="Filière(s)"
                  hint="Vous pouvez cocher plusieurs choix, avec un minimum d’une filière"
                  state={errors?.domaineIds ? "error" : "default"}
                  stateRelatedMessage={errors?.domaineIds?.message}
                  withSelectAll
                  options={availableDomaineOptions}
                  selectedOptions={selectedDomaineOptions}
                  placeholder={(selectedItemsCount) =>
                    selectedItemsCount
                      ? `${selectedItemsCount} filières séléctionnées`
                      : "Cochez toutes les filières concernées"
                  }
                  onChange={(values) => {
                    domaineIdsController.field.onChange(
                      values.map((value) => value.value)
                    );
                  }}
                />
              </>
            )}
            {currentTypology === "expertBranche" && (
              <>
                <Notice
                  className="mb-4"
                  title={
                    <>
                      <span>
                        En tant qu’Architecte Accompagnateur de Parcours expert
                        de branche(s), votre offre de service couvre l'ensemble
                        des Certificats de Qualification professionnelle /
                        Titres à visée professionnelle rattachés à une
                        convention collective sélectionnée.
                      </span>
                      <br />
                      <a
                        href="https://airtable.com/shrWVrEQJuZNC7F6U/tblWDa9HN0cuqLnAl"
                        target="_blank"
                        title="Retrouvez l'ensemble des certifications vous concernant - nouvelle page"
                      >
                        Retrouvez l'ensemble des certifications vous concernant
                      </a>
                    </>
                  }
                />
                <MultiSelect
                  label="Conventions collectives auxquelles vous êtes rattaché"
                  hint="Vous pouvez cocher plusieurs conventions collectives"
                  state={errors?.ccnIds ? "error" : "default"}
                  stateRelatedMessage={errors?.ccnIds?.message}
                  withSelectAll
                  options={availableConventionOptions}
                  selectedOptions={selectedConventionOptions}
                  placeholder={(selectedItemsCount) =>
                    selectedItemsCount
                      ? `${selectedItemsCount} conventions collectives séléctionnées`
                      : "Cochez les conventions collectives concernées"
                  }
                  onChange={(values) => {
                    ccnIdsController.field.onChange(
                      values.map((value) => value.value)
                    );
                  }}
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
              selectAllLabel="Cocher toute la France métropolitaine"
              unSelectAllLabel="Décocher toute la France métropolitaine"
              options={availableDepartmentOptions}
              selectedOptions={selectedOnSiteDepartmentOptions}
              ignoredOptionsOnSelectAll={domTomDepartmentOptions}
              placeholder={(selectedItemsCount) =>
                selectedItemsCount
                  ? `${selectedItemsCount} départements séléctionnés`
                  : "Cochez les départements concernés"
              }
              onChange={(values) => {
                onSiteDepartmentsController.field.onChange(
                  values.map((value) => value.value)
                );
              }}
            />
            <MultiSelect
              label="Zone d’intervention en distanciel"
              hint="Cochez les départements couverts en distanciel"
              withSelectAll
              selectAllLabel="Cocher toute la France métropolitaine"
              unSelectAllLabel="Décocher toute la France métropolitaine"
              options={availableDepartmentOptions}
              selectedOptions={selectedRemoteDepartmentOptions}
              ignoredOptionsOnSelectAll={domTomDepartmentOptions}
              placeholder={(selectedItemsCount) =>
                selectedItemsCount
                  ? `${selectedItemsCount} départements séléctionnés`
                  : "Cochez les départements concernés"
              }
              onChange={(values) => {
                remoteDepartmentsController.field.onChange(
                  values.map((value) => value.value)
                );
              }}
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
