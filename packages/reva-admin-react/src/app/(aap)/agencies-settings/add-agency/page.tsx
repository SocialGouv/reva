"use client";

import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { AgencyFormData, agencyFormSchema } from "./agencyFormSchema";
import { useAgencyPage } from "./addAgencyPage.hook";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";

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
    <>
      <div className="w-full flex flex-col">
        <h1 className="mb-12">Ajout d’une agence</h1>
        <FormProvider {...methods}>
          <form
            className="flex flex-col gap-8"
            onSubmit={handleFormSubmit}
            onReset={(e) => {
              e.preventDefault();
              handleReset();
            }}
          >
            <div className="flex flex-col gap-8">
              <fieldset className="flex flex-col gap-4 mb-4">
                <legend className="text-3xl font-bold mb-4">
                  Informations affichées au candidat
                </legend>
                <p>
                  Les candidats auront accès à ces informations lors de leurs
                  recherches. Elles apparaîtront également dans le mail
                  récapitulatif de leur candidature.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <Input
                      className="!mb-4"
                      label={<div className="mb-8">Nom commercial</div>}
                      nativeInputProps={{ ...register("nom") }}
                      state={errors.nom ? "error" : "default"}
                      stateRelatedMessage={errors.nom?.message?.toString()}
                    />
                  </div>

                  <div>
                    <Input
                      className="!mb-4"
                      label="Site internet de l'établissement"
                      hintText="(optionnel)"
                      nativeInputProps={{ ...register("siteInternet") }}
                      state={errors.siteInternet ? "error" : "default"}
                      stateRelatedMessage={errors.siteInternet?.message?.toString()}
                    />
                    <SmallNotice>
                      Ajouter le lien de votre établissement peut permettre à
                      celui-ci de se démarquer lorsque le candidat choisira son
                      organisme accompagnateur.
                    </SmallNotice>
                  </div>

                  <div>
                    <Input
                      className="!mb-4"
                      label="Téléphone"
                      nativeInputProps={{ ...register("telephone") }}
                      state={errors.telephone ? "error" : "default"}
                      stateRelatedMessage={errors.telephone?.message?.toString()}
                    />
                    <SmallNotice>
                      Ce numéro de téléphone sera également envoyé aux candidats
                      dans le récapitulatif de leur candidature.
                    </SmallNotice>
                  </div>

                  <div>
                    <Input
                      className="!mb-4"
                      label="E-mail de contact"
                      nativeInputProps={{ ...register("emailContact") }}
                      state={errors.emailContact ? "error" : "default"}
                      stateRelatedMessage={errors.emailContact?.message?.toString()}
                    />
                    <SmallNotice>
                      Cet e-mail sera également envoyé aux candidats dans le le
                      récapitulatif de leur candidature.
                    </SmallNotice>
                  </div>
                </div>
              </fieldset>
              <fieldset className="flex flex-col gap-4 w-full">
                <legend className="text-3xl font-bold mb-4">
                  Adresse de l'agence
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  <Input
                    className="!mb-4"
                    label={<div className="mb-8">Numéro et nom de rue</div>}
                    nativeInputProps={{
                      ...register("adresseNumeroEtNomDeRue"),
                    }}
                    state={errors.adresseNumeroEtNomDeRue ? "error" : "default"}
                    stateRelatedMessage={errors.adresseNumeroEtNomDeRue?.message?.toString()}
                  />

                  <Input
                    className="!mb-4"
                    label="Informations complémentaires"
                    hintText="(optionnel)"
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
                    className="!mb-4"
                    label="Code Postal"
                    nativeInputProps={{ ...register("adresseCodePostal") }}
                    state={errors.adresseCodePostal ? "error" : "default"}
                    stateRelatedMessage={errors.adresseCodePostal?.message?.toString()}
                  />

                  <Input
                    className="!mb-4"
                    label="Ville"
                    nativeInputProps={{ ...register("adresseVille") }}
                    state={errors.adresseVille ? "error" : "default"}
                    stateRelatedMessage={errors.adresseVille?.message?.toString()}
                  />
                </div>
                <div className="w-full">
                  <RadioButtons
                    className="m-0 p-0"
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
                    ]}
                    state={
                      errors.conformeNormesAccessbilite ? "error" : "default"
                    }
                    stateRelatedMessage={"Veuillez sélectionner une option"}
                  />
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-3xl font-bold mb-4">
                  Filières, branches et niveaux
                </legend>
                <p>
                  Sélectionnez les filières et les niveaux de certification que
                  vous couvrez (du niveau 3 à 8).
                  <br />
                  Vous apparaîtrez dans les résultats de recherche pour les
                  filières et niveaux de certification sélectionnés.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 mt-10">
                  <fieldset className="flex flex-col gap-4">
                    <legend className="text-3xl font-bold mb-4">
                      Filières
                    </legend>
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
                          Quels sont les niveaux de certification couverts sur
                          vos filières sélectionnées ?
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
        </FormProvider>
      </div>
    </>
  );
};

export default AddAgencyPage;
