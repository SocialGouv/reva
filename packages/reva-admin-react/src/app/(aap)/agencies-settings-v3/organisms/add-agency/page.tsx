"use client";

import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { ConformiteNormeAccessibilite } from "@/graphql/generated/graphql";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAgencyPage } from "./addAgencyPage.hook";
import { AgencyFormData, agencyFormSchema } from "./agencyFormSchema";

const defaultValues: AgencyFormData = {
  nom: "",
  adresseNumeroEtNomDeRue: "",
  adresseInformationsComplementaires: "",
  adresseCodePostal: "",
  adresseVille: "",
  telephone: "",
  emailContact: "",
  siteInternet: "",
  conformeNormesAccessibilite: "",
};
const AddAgencyPage = () => {
  const router = useRouter();

  const { createAgencyInfo, headAgencyPhone, headAgencyEmail } =
    useAgencyPage();

  const methods = useForm<AgencyFormData>({
    defaultValues,
    resolver: zodResolver(agencyFormSchema),
  });

  const { register, handleSubmit, reset, formState, setValue } = methods;
  const { errors } = formState;

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
      conformeNormesAccessibilite:
        data.conformeNormesAccessibilite as ConformiteNormeAccessibilite,
    };

    try {
      await createAgencyInfo.mutateAsync(organismData);
      successToast("Modifications enregistrées");
      router.push("/agencies-settings-v3");
    } catch (e) {
      graphqlErrorToast(e);
    }
  });

  const handleReset = useCallback(() => {
    reset(defaultValues);
  }, [reset]);

  useEffect(() => {
    handleReset();
  }, [handleReset]);

  const handleCheckUseHeadAgencyInfo = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.checked) {
      if (headAgencyPhone) {
        setValue("telephone", headAgencyPhone);
      }
      if (headAgencyEmail) {
        setValue("emailContact", headAgencyEmail);
      }
    } else {
      setValue("telephone", "");
      setValue("emailContact", "");
    }
  };

  return (
    <div>
      <h1>Informations affichées aux candidats</h1>
      <FormOptionalFieldsDisclaimer />
      <p className="text-xl">
        Renseignez les informations liées au lieu d'accueil qui accueillera les
        candidats. Celles-ci seront visibles dans leurs résultats de recherche.
      </p>
      <form
        onSubmit={handleFormSubmit}
        onReset={(e) => {
          e.preventDefault();
          handleReset();
        }}
      >
        <div className="flex flex-col gap-8">
          <fieldset className="flex flex-col mt-6">
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
                className="col-span-2"
                label="Ville"
                nativeInputProps={{ ...register("adresseVille") }}
                state={errors.adresseVille ? "error" : "default"}
                stateRelatedMessage={errors.adresseVille?.message?.toString()}
              />

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

              <Checkbox
                className="col-span-3"
                options={[
                  {
                    label:
                      "Utiliser le téléphone et l'e-mail renseignés dans les informations générales.",
                    nativeInputProps: {
                      onChange: handleCheckUseHeadAgencyInfo,
                    },
                  },
                ]}
              />

              <RadioButtons
                className="col-span-3"
                legend="Le lieu d’accueil est-il conforme aux normes d'accessibilité pour les personnes à mobilité réduite ?"
                options={[
                  {
                    label: "Oui",
                    nativeInputProps: {
                      value: "CONFORME",
                      ...register("conformeNormesAccessibilite"),
                    },
                  },
                  {
                    label: "Non",
                    nativeInputProps: {
                      value: "NON_CONFORME",
                      ...register("conformeNormesAccessibilite"),
                    },
                  },
                ]}
                state={errors.conformeNormesAccessibilite ? "error" : "default"}
                stateRelatedMessage={"Veuillez sélectionner une option"}
              />
            </div>
          </fieldset>
        </div>

        <FormButtons formState={formState} backUrl={"/agencies-settings-v3"} />
      </form>
    </div>
  );
};

export default AddAgencyPage;
