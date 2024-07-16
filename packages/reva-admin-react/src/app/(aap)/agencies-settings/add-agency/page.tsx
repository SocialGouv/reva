"use client";

import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { AgencyFormData, agencyFormSchema } from "./agencyFormSchema";
import { useAgencyPage } from "./addAgencyPage.hook";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";

const AddAgencyPage = () => {
  const router = useRouter();

  const { degrees, domaines, createAgency } = useAgencyPage();

  const methods = useForm<AgencyFormData>({
    resolver: zodResolver(agencyFormSchema),
    defaultValues: { organismDegrees: [], organismDomaines: [] },
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = methods;

  const { fields: organismDegreesFields } = useFieldArray({
    control,
    name: "organismDegrees",
  });

  const { fields: organismDomainesFields } = useFieldArray({
    control,
    name: "organismDomaines",
  });

  const handleFormSubmit = handleSubmit(async (data) => {
    const organismData = {
      nom: data.nom,
      address: data.adresseNumeroEtNomDeRue,
      adresseInformationsComplementaires:
        data.adresseInformationsComplementaires,
      zip: data.adresseCodePostal,
      city: data.adresseVille,
      contactAdministrativeEmail: data.emailContact,
      contactAdministrativePhone: data.telephone,
      website: data.siteInternet,
      conformeNormesAccessbilite: data.conformeNormesAccessbilite,
      domaineIds: data.organismDomaines
        .filter((d) => d.checked)
        .map((d) => d.id),
      degreeIds: data.organismDegrees.filter((d) => d.checked).map((d) => d.id),
    };

    try {
      await createAgency.mutateAsync(organismData);
      successToast("Modifications enregistrées");
      router.push("/agencies-settings/legal-information/");
    } catch (e) {
      graphqlErrorToast(e);
    }
  });

  const handleReset = useCallback(() => {
    reset({
      organismDegrees: degrees
        .filter((d) => d.level > 2)
        .map((d) => ({
          id: d.id,
          label: d.longLabel,
          checked: false,
        })),
      organismDomaines: domaines.map((d) => ({
        id: d.id,
        label: d.label,
        checked: false,
      })),
    });
  }, [degrees, domaines, reset]);

  useEffect(() => {
    handleReset();
  }, [handleReset]);

  return (
    <div className="w-full flex flex-col">
      <h1 className="mb-12">Lieu d’accueil pour les accompagnements</h1>
      <FormOptionalFieldsDisclaimer />
      <p>
        Renseignez les informations générales sur le lieu d’accueil qui recevra
        les candidats en présentiel. Ces informations seront affichées dans les
        résultats de recherche.
      </p>
      <form
        className="flex flex-col gap-8"
        onSubmit={handleFormSubmit}
        onReset={(e) => {
          e.preventDefault();
          handleReset();
        }}
      >
        <div className="flex flex-col gap-8">
          <fieldset className="flex flex-col mt-6">
            <legend className="text-3xl font-bold mb-4">
              Informations sur le lieu d’accueil
            </legend>
            <p>
              Les candidats auront accès à ces informations lors de leurs
              recherches. Elles apparaîtront également dans le mail
              récapitulatif de leur candidature.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6">
              <Input
                className="col-span-3"
                label="Nom du lieu d’accueil (affiché aux candidats)"
                nativeInputProps={{ ...register("nom") }}
                state={errors.nom ? "error" : "default"}
                stateRelatedMessage={errors.nom?.message?.toString()}
              />

              <Input
                className="col-span-3"
                label="Numéro et nom de rue"
                nativeInputProps={{
                  ...register("adresseNumeroEtNomDeRue"),
                }}
                state={errors.adresseNumeroEtNomDeRue ? "error" : "default"}
                stateRelatedMessage={errors.adresseNumeroEtNomDeRue?.message?.toString()}
              />

              <Input
                className="col-span-3"
                label="Informations complémentaires (optionnel)"
                nativeInputProps={{
                  ...register("adresseInformationsComplementaires"),
                  autoComplete: "off",
                }}
                state={
                  errors.adresseInformationsComplementaires
                    ? "error"
                    : "default"
                }
                stateRelatedMessage={errors.adresseInformationsComplementaires?.message?.toString()}
              />
              <Input
                label="Code Postal"
                nativeInputProps={{ ...register("adresseCodePostal") }}
                state={errors.adresseCodePostal ? "error" : "default"}
                stateRelatedMessage={errors.adresseCodePostal?.message?.toString()}
              />

              <Input
                label="Ville"
                nativeInputProps={{ ...register("adresseVille") }}
                state={errors.adresseVille ? "error" : "default"}
                stateRelatedMessage={errors.adresseVille?.message?.toString()}
              />
              <span />

              <Input
                label="Téléphone"
                nativeInputProps={{ ...register("telephone") }}
                state={errors.telephone ? "error" : "default"}
                stateRelatedMessage={errors.telephone?.message?.toString()}
              />

              <Input
                label="E-mail de contact"
                nativeInputProps={{ ...register("emailContact") }}
                state={errors.emailContact ? "error" : "default"}
                stateRelatedMessage={errors.emailContact?.message?.toString()}
              />

              <Input
                label="Site internet (optionnel)"
                nativeInputProps={{ ...register("siteInternet") }}
                state={errors.siteInternet ? "error" : "default"}
                stateRelatedMessage={errors.siteInternet?.message?.toString()}
              />

              <RadioButtons
                className="col-span-3"
                legend="Le lieu d’accueil est-il conforme aux normes d'accessibilité pour les personnes à mobilité réduite ?"
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
                ]}
                state={errors.conformeNormesAccessbilite ? "error" : "default"}
                stateRelatedMessage={"Veuillez sélectionner une option"}
              />
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-3xl font-bold mb-4">
              Filières, branches et niveaux
            </legend>
            <p>
              Sélectionnez les filières et les niveaux de certification que vous
              couvrez (du niveau 3 à 8).
              <br />
              Vous apparaîtrez dans les résultats de recherche pour les filières
              et niveaux de certification sélectionnés.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 mt-10">
              <fieldset className="flex flex-col gap-4">
                <legend className="text-3xl font-bold mb-4">Filières</legend>
                <Checkbox
                  legend={
                    <p className="text-sm">
                      Quelles sont les filières que vous couvrez ?
                    </p>
                  }
                  options={organismDomainesFields.map((od, odIndex) => ({
                    label: od.label,
                    nativeInputProps: {
                      ...register(`organismDomaines.${odIndex}.checked`),
                    },
                  }))}
                />
              </fieldset>

              <fieldset className="flex flex-col gap-4">
                <legend className="text-3xl font-bold mb-4">
                  Niveaux de certification
                </legend>
                <Checkbox
                  legend={
                    <p className="text-sm">
                      Quels sont les niveaux de certification que vous couvrez ?
                    </p>
                  }
                  options={organismDegreesFields.map((od, odIndex) => ({
                    label: od.label,
                    nativeInputProps: {
                      ...register(`organismDegrees.${odIndex}.checked`),
                    },
                  }))}
                />
              </fieldset>
            </div>
          </fieldset>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-end justify-between">
          <div></div>
          <div className="flex flex-col md:flex-row gap-4 self-center md:self-end mt-8 md:mt-0">
            <Button priority="secondary" type="reset">
              Annuler les modifications
            </Button>
            <Button disabled={isSubmitting}>Enregistrer</Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddAgencyPage;
