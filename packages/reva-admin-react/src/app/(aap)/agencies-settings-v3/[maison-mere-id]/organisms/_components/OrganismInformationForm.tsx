"use client";

import { useOrganismInformationForm } from "./organismInformationForm.hook";
import {
  OrganismInformationFormData,
  organismInformationFormSchema,
} from "./organismInformationFormSchema";

import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

const OrganismInformationForm = ({
  mutationOnSubmit,
  pathRedirection,
  defaultData,
}: {
  mutationOnSubmit: (data: OrganismInformationFormData) => Promise<void>;
  pathRedirection: string;
  defaultData?: Partial<OrganismInformationFormData>;
}) => {
  const router = useRouter();

  const defaultValues: OrganismInformationFormData = useMemo(
    () => ({
      nomPublic: defaultData?.nomPublic ?? "",
      adresseNumeroEtNomDeRue: defaultData?.adresseNumeroEtNomDeRue ?? "",
      adresseInformationsComplementaires: "",
      adresseCodePostal: defaultData?.adresseCodePostal ?? "",
      adresseVille: defaultData?.adresseVille ?? "",
      telephone: defaultData?.telephone ?? "",
      emailContact: defaultData?.emailContact ?? "",
      siteInternet: defaultData?.siteInternet ?? "",
      conformeNormesAccessibilite:
        defaultData?.conformeNormesAccessibilite ?? "",
    }),
    [defaultData],
  );

  const {
    gestionnaireMaisonMerAAPOrganismPhone,
    gestionnaireMaisonMerAAPOrganismEmail,
  } = useOrganismInformationForm();

  const methods = useForm<OrganismInformationFormData>({
    defaultValues,
    resolver: zodResolver(organismInformationFormSchema),
  });

  const { register, handleSubmit, reset, formState, setValue } = methods;
  const { errors, isDirty, isSubmitting } = formState;

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      await mutationOnSubmit(data);
      successToast("Modifications enregistrées");
      router.push(pathRedirection);
    } catch (e) {
      graphqlErrorToast(e);
    }
  });

  const handleReset = useCallback(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

  useEffect(() => {
    handleReset();
  }, [handleReset]);

  const handleCheckUseGestionnaireMaisonMerAAPOrganismEmailInfo = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.checked) {
      if (gestionnaireMaisonMerAAPOrganismPhone) {
        setValue("telephone", gestionnaireMaisonMerAAPOrganismPhone);
      }
      if (gestionnaireMaisonMerAAPOrganismEmail) {
        setValue("emailContact", gestionnaireMaisonMerAAPOrganismEmail);
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
                nativeInputProps={{ ...register("nomPublic") }}
                state={errors.nomPublic ? "error" : "default"}
                stateRelatedMessage={errors.nomPublic?.message?.toString()}
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
                label="Code postal"
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
                label="E-mail de contact (affiché aux candidats)"
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
                      onChange:
                        handleCheckUseGestionnaireMaisonMerAAPOrganismEmailInfo,
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
                stateRelatedMessage={
                  errors.conformeNormesAccessibilite &&
                  "Veuillez sélectionner une option"
                }
              />
            </div>
          </fieldset>
        </div>

        <FormButtons
          formState={{ isDirty, isSubmitting }}
          backUrl={pathRedirection}
        />
      </form>
    </div>
  );
};

export default OrganismInformationForm;
