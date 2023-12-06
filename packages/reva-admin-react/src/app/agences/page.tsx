"use client";

import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { errorToast, successToast } from "@/components/toast/toast";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormEvent, useEffect } from "react";
import { useForm } from "react-hook-form";
import ZoneIntervention from "../account-settings/components/zone-intervention/ZoneIntervention";
import { AgenceFormData, agenceFormSchema } from "./agenceFormSchema";

const mockRegionsWithNestedDepartments = [
  {
    id: "region-1",
    label: "Région 1",
    isSelected: false,
    departments: [
      {
        id: "department-1",
        label: "Département 1",
        isSelected: false,
      },
      {
        id: "department-2",
        label: "Département 2",
        isSelected: false,
      },
      {
        id: "department-3",
        label: "Département 3",
        isSelected: false,
      },
    ],
  },
  {
    id: "region-2",
    label: "Région 2",
    isSelected: false,
    departments: [
      {
        id: "department-4",
        label: "Département 4",
        isSelected: false,
      },
      {
        id: "department-5",
        label: "Département 5",
        isSelected: false,
      },
      {
        id: "department-6",
        label: "Département 6",
        isSelected: false,
      },
    ],
  },
  {
    id: "region-3",
    label: "Région 3",
    isSelected: false,
    departments: [
      {
        id: "department-7",
        label: "Département 7",
        isSelected: false,
      },
      {
        id: "department-8",
        label: "Département 8",
        isSelected: false,
      },
      {
        id: "department-9",
        label: "Département 9",
        isSelected: false,
      },
    ],
  },
];

const AgencesHomePage = () => {
  const { isFeatureActive } = useFeatureflipping();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<AgenceFormData>({
    resolver: zodResolver(agenceFormSchema),
  });

  useEffect(() => {
    //TODO Get data from API
    setValue("zoneInterventionPresentiel", mockRegionsWithNestedDepartments);
    setValue("zoneInterventionDistanciel", mockRegionsWithNestedDepartments);
  }, [setValue]);

  const handleFormSubmit = handleSubmit(async (data) => {
    console.log("LOG > ~ data:", data);
    const zoneInterventionPresentiel = data.zoneInterventionPresentiel;
    const zoneInterventionDistanciel = data.zoneInterventionDistanciel;

    const zoneInterventionPresentielOrDistancielHasAtLeastOneSelected = [
      zoneInterventionPresentiel,
      zoneInterventionDistanciel,
    ].some((zoneIntervention) =>
      zoneIntervention.some((region) =>
        region.departments.some((department) => department.isSelected),
      ),
    );
    if (!zoneInterventionPresentielOrDistancielHasAtLeastOneSelected) {
      errorToast("Veuillez sélectionner au moins un département");
      return;
    }
    successToast("Agence créée avec succès");
  });

  const handleReset = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    reset({
      adresseNumeroEtNomDeRue: "",
      adresseInformationsComplementaires: "",
      adresseCodePostal: "",
      adresseVille: "",
      nom: "",
      telephone: "",
      siteInternet: "",
      emailContact: "",
      conformeNormesAccessbilite: undefined,
      agenceVisible: false,
      zoneInterventionPresentiel: mockRegionsWithNestedDepartments,
      zoneInterventionDistanciel: mockRegionsWithNestedDepartments,
    });
  };

  //TODO Get data from API
  const nomAgence = "todo nom agence";

  return (
    <div className="w-full flex flex-col items-center justify-center p-8">
      <form onSubmit={handleFormSubmit} onReset={handleReset}>
        <h3 className="w-full font-bold text-[28px] uppercase">{nomAgence}</h3>

        <fieldset className="flex flex-col gap-4 w-full mt-4">
          <legend className="text-2xl font-bold mb-4">
            Adresse de l'agence
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <Input
              className="!mb-4"
              label="Numéro et nom de rue"
              nativeInputProps={{ ...register("adresseNumeroEtNomDeRue") }}
              state={errors.adresseNumeroEtNomDeRue ? "error" : "default"}
              stateRelatedMessage={errors.adresseNumeroEtNomDeRue?.message}
            />

            <Input
              className="!mb-4"
              label="Informations complémentaires (optionnel)"
              nativeInputProps={{
                ...register("adresseInformationsComplementaires"),
              }}
              state={
                errors.adresseInformationsComplementaires ? "error" : "default"
              }
              stateRelatedMessage={
                errors.adresseInformationsComplementaires?.message
              }
            />
            <Input
              className="!mb-4"
              label="Code Postal"
              nativeInputProps={{ ...register("adresseCodePostal") }}
              state={errors.adresseCodePostal ? "error" : "default"}
              stateRelatedMessage={errors.adresseCodePostal?.message}
            />

            <Input
              className="!mb-4"
              label="Ville"
              nativeInputProps={{ ...register("adresseVille") }}
              state={errors.adresseVille ? "error" : "default"}
              stateRelatedMessage={errors.adresseVille?.message}
            />
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-4 mt-4">
          <legend className="text-2xl font-bold mb-4">
            Informations commerciales de l’agence affichées aux candidats
            (optionnelles)
          </legend>
          <Alert
            severity="info"
            className="mb-4"
            title=""
            description="Les informations suivantes seront affichées aux candidats dans les résultats de recherche d’un AAP et dans le message récapitulant leur candidature. Si elles ne sont pas renseignées, les informations juridiques et administrateur seront prises par défaut."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <Input
                className="!mb-4"
                label="Nom commercial  (optionnel)"
                nativeInputProps={{ ...register("nom") }}
                state={errors.nom ? "error" : "default"}
                stateRelatedMessage={errors.nom?.message}
              />
              <SmallNotice>
                Si vous ne renseignez pas ce champ, votre raison sociale sera
                affichée aux candidats par défaut.
              </SmallNotice>
            </div>

            <div>
              <Input
                className="!mb-4"
                label="Téléphone"
                nativeInputProps={{ ...register("telephone") }}
                state={errors.telephone ? "error" : "default"}
                stateRelatedMessage={errors.telephone?.message}
              />
              <SmallNotice>
                Ce numéro de téléphone sera également envoyé aux candidats dans
                le message récapitulant leur inscription.
              </SmallNotice>
            </div>

            <div>
              <Input
                className="!mb-4"
                label="Site internet de l'établissement (optionnel)"
                nativeInputProps={{ ...register("siteInternet") }}
                state={errors.siteInternet ? "error" : "default"}
                stateRelatedMessage={errors.siteInternet?.message}
              />
              <SmallNotice>
                Ajouter le lien de votre établissement peut permettre à celui-ci
                de se démarquer lorsque le candidat choisira son organisme
                accompagnateur.
              </SmallNotice>
            </div>

            <div>
              <Input
                className="!mb-4"
                label="E-mail de contact"
                nativeInputProps={{ ...register("emailContact") }}
                state={errors.emailContact ? "error" : "default"}
                stateRelatedMessage={errors.emailContact?.message}
              />
              <SmallNotice>
                Cet e-mail sera également envoyé aux candidats dans le message
                récapitulant leur inscription.
              </SmallNotice>
            </div>
          </div>
        </fieldset>

        <div className="w-full mt-4">
          <RadioButtons
            legend="Votre établissement est-il conforme aux normes d'accessibilité et peut recevoir du public à mobilité réduite (PMR) ?"
            options={[
              {
                label: "Oui",
                nativeInputProps: {
                  value: "CONFORME",
                  ...register("conformeNormesAccessbilite"),
                },
              },
              {
                label: "Non",
                nativeInputProps: {
                  value: "NON_CONFORME",
                  ...register("conformeNormesAccessbilite"),
                },
              },
              {
                label: "Cet établissement ne reçoit pas de public",
                nativeInputProps: {
                  value: "ETABLISSEMENT_NE_RECOIT_PAS_DE_PUBLIC",
                  ...register("conformeNormesAccessbilite"),
                },
              },
            ]}
            state={errors.conformeNormesAccessbilite ? "error" : "default"}
            stateRelatedMessage={"Veuillez sélectionner une option"}
          />
        </div>

        <fieldset className="flex flex-col gap-4 mt-4 w-1/2 self-start">
          <legend className="text-2xl font-bold mb-4">
            Visibilité de l’agence
          </legend>
          <ToggleSwitch
            inputTitle="Rendre l’agence visible aux candidats sur France VAE"
            label="Rendre l’agence visible aux candidats sur France VAE"
            labelPosition="left"
            showCheckedHint={false}
            checked={watch("agenceVisible")}
            onChange={(isChecked) => setValue("agenceVisible", isChecked)}
          />
        </fieldset>

        <div className="w-full mt-4">
          <ZoneIntervention
            setZoneInterventionPresentiel={(zoneInterventionValue) =>
              setValue("zoneInterventionPresentiel", zoneInterventionValue)
            }
            setZoneInterventionDistanciel={(zoneInterventionValue) =>
              setValue("zoneInterventionDistanciel", zoneInterventionValue)
            }
            zoneInterventionPresentiel={watch("zoneInterventionPresentiel")}
            zoneInterventionDistanciel={watch("zoneInterventionDistanciel")}
          />
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-end justify-between mt-10">
          {/* <Button priority="secondary">Suppprimer l'agence</Button> */}
          <div />
          <div className="flex flex-col md:flex-row gap-4 self-center md:self-end mt-8 md:mt-0">
            <Button priority="secondary" type="reset">
              Annuler les modifications
            </Button>
            <Button disabled={isSubmitting}>Valider les modifications</Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AgencesHomePage;
