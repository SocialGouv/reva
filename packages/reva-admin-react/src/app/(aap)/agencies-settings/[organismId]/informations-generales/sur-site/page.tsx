"use client";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useInformationsGeneralesOnSitePage } from "./informationsGeneralesOnSite.hook";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import {
  InformationsGeneralesOnSiteFormData,
  informationsGeneralesOnSiteFormSchema,
} from "./informationsGeneralesOnSiteFormSchema";

const InformationsGeneralesOnSitePage = () => {
  const {
    organism,
    getOrganismStatus,
    refetchOrganism,
    createOrUpdateInformationsCommercialesOnSiteStatus,
  } = useInformationsGeneralesOnSitePage();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<InformationsGeneralesOnSiteFormData>({
    resolver: zodResolver(informationsGeneralesOnSiteFormSchema),
  });

  const handleReset = useCallback(() => {
    reset({
      ...organism?.informationsCommerciales,
    } as InformationsGeneralesOnSiteFormData);
  }, [organism, reset]);

  useEffect(() => handleReset(), [handleReset]);

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      await createOrUpdateInformationsCommercialesOnSiteStatus.mutateAsync({
        organismId: organism?.id,
        informationsCommerciales: data,
      });
      successToast("modifications enregistrées");
      await refetchOrganism();
    } catch (e) {
      graphqlErrorToast(e);
    }
  });

  return (
    <div className="flex flex-col">
      <h1>Informations générales</h1>
      <FormOptionalFieldsDisclaimer />
      <p>
        Renseignez les informations qui seront affichées dans les résultats de
        recherche des candidats.
      </p>

      {getOrganismStatus === "success" && (
        <>
          <form
            className="flex flex-col mt-6"
            onSubmit={handleFormSubmit}
            onReset={(e) => {
              e.preventDefault();
              handleReset();
            }}
          >
            <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <Input
                className="col-span-2"
                label="Nom du collaborateur ou de la structure"
                state={errors.nom ? "error" : "default"}
                stateRelatedMessage={errors.nom?.message}
                nativeInputProps={{
                  ...register("nom"),
                  placeholder:
                    "[Nom choisi par l'administrateur pour afficher ce lieu au candidat]",
                }}
              />
              <Input
                className="col-span-2"
                label="Numéro et nom de rue"
                nativeInputProps={{
                  ...register("adresseNumeroEtNomDeRue"),
                }}
                state={errors.adresseNumeroEtNomDeRue ? "error" : "default"}
                stateRelatedMessage={errors.adresseNumeroEtNomDeRue?.message}
              />
              <Input
                className="col-span-2"
                label="Informations complémentaires"
                nativeInputProps={{
                  ...register("adresseInformationsComplementaires"),
                  autoComplete: "off",
                  placeholder: "[Information complémentaires au besoin]",
                }}
                state={
                  errors.adresseInformationsComplementaires
                    ? "error"
                    : "default"
                }
                stateRelatedMessage={
                  errors.adresseInformationsComplementaires?.message
                }
              />
              <Input
                label="Code Postal"
                nativeInputProps={{
                  ...register("adresseCodePostal"),
                  placeholder: "[XXXXX]",
                }}
                state={errors.adresseCodePostal ? "error" : "default"}
                stateRelatedMessage={errors.adresseCodePostal?.message}
              />
              <Input
                label="Ville"
                nativeInputProps={{
                  ...register("adresseVille"),
                  placeholder: "[Ville de cette structure]",
                }}
                state={errors.adresseVille ? "error" : "default"}
                stateRelatedMessage={errors.adresseVille?.message}
              />
              <Input
                label="Téléphone"
                nativeInputProps={{
                  ...register("telephone"),
                  placeholder: "[33 XX XX XX XX XX]",
                }}
              />
              <Input
                label="E-mail de contact"
                state={errors.emailContact ? "error" : "default"}
                stateRelatedMessage={errors.emailContact?.message}
                nativeInputProps={{
                  ...register("emailContact"),
                  placeholder: "[prenom.nom@compte.com]",
                }}
              />
              <Input
                className="col-span-2"
                label="Site internet de l'établissement (optionnel)"
                nativeInputProps={{
                  ...register("siteInternet"),
                  placeholder: "[URL]",
                }}
              />
              <RadioButtons
                className="col-span-2"
                legend="Votre établissement est-il conforme aux normes d'accessibilité et peut
            recevoir du public à mobilité réduite ?"
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
              />
            </fieldset>
            <div className="flex flex-col md:flex-row gap-4 self-center md:self-end mt-8">
              <Button priority="secondary" type="reset">
                Réinitialiser
              </Button>
              <Button disabled={isSubmitting}>Enregistrer</Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default InformationsGeneralesOnSitePage;
