"use client";
import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { useModalitesAccompagnementPage } from "./modalitesAccompagnement.hook";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { RemoteZone } from "@/graphql/generated/graphql";

const schema = z.object({
  nom: z.string().min(1, "Ce champ est obligatoire"),
  telephone: z.string().optional().default(""),
  siteInternet: z.string().optional().default(""),
  emailContact: z
    .union([
      z
        .string()
        .length(0, "Le champ doit être vide ou contenir une adresse email"),
      z.string().email("Le champ doit être vide ou contenir une adresse email"),
    ])
    .optional()
    .default(""),
  isOnSite: z.boolean(),
  isRemote: z.boolean(),
  isRemoteFranceMetropolitaine: z.boolean(),
  isRemoteGuadeloupe: z.boolean(),
  isRemoteGuyane: z.boolean(),
  isRemoteMartinique: z.boolean(),
  isRemoteMayotte: z.boolean(),
  isRemoteLaReunion: z.boolean(),
  adresseNumeroEtNomDeRue: z.string().optional().default(""),
  adresseInformationsComplementaires: z.string().optional().default(""),
  adresseCodePostal: z
    .string()
    .regex(/^(\d{5}|)$/, "Ce champ doit être vide ou contenir un code postal"),
  adresseVille: z.string().optional().default(""),
  conformeNormesAccessbilite: z
    .enum(["CONFORME", "NON_CONFORME", "ETABLISSEMENT_NE_RECOIT_PAS_DE_PUBLIC"])
    .nullable(),
});

type FormData = z.infer<typeof schema>;

const ModalitesAccompagnementPage = () => {
  const {
    organism,
    getOrganismStatus,
    refetchOrganism,
    createOrUpdateInformationsCommercialesAndOnSiteAndRemoteStatuses,
  } = useModalitesAccompagnementPage();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleReset = useCallback(() => {
    reset({
      ...organism?.informationsCommerciales,
      isOnSite: organism?.isHeadAgency ? organism?.isOnSite : true, //All agencies are on site except the head one which can either be on site or not
      isRemoteFranceMetropolitaine: organism?.remoteZones?.includes(
        "FRANCE_METROPOLITAINE",
      ),
      isRemoteGuadeloupe: organism?.remoteZones?.includes("GUADELOUPE"),
      isRemoteGuyane: organism?.remoteZones?.includes("GUYANE"),
      isRemoteLaReunion: organism?.remoteZones?.includes("LA_REUNION"),
      isRemoteMartinique: organism?.remoteZones?.includes("MARTINIQUE"),
      isRemoteMayotte: organism?.remoteZones?.includes("MAYOTTE"),
      isRemote: organism?.isRemote,
    } as FormData);
  }, [organism, reset]);

  useEffect(() => handleReset(), [handleReset]);

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      const {
        isOnSite,
        isRemote,
        isRemoteFranceMetropolitaine,
        isRemoteGuadeloupe,
        isRemoteGuyane,
        isRemoteLaReunion,
        isRemoteMartinique,
        isRemoteMayotte,
        ...informationsCommerciales
      } = data;

      const remoteZones: RemoteZone[] = [];

      if (isRemote) {
        if (isRemoteFranceMetropolitaine) {
          remoteZones.push("FRANCE_METROPOLITAINE");
        }
        if (isRemoteGuadeloupe) {
          remoteZones.push("GUADELOUPE");
        }
        if (isRemoteGuyane) {
          remoteZones.push("GUYANE");
        }
        if (isRemoteLaReunion) {
          remoteZones.push("LA_REUNION");
        }
        if (isRemoteMartinique) {
          remoteZones.push("MARTINIQUE");
        }
        if (isRemoteMayotte) {
          remoteZones.push("MAYOTTE");
        }
      }

      await createOrUpdateInformationsCommercialesAndOnSiteAndRemoteStatuses.mutateAsync(
        {
          organismId: organism?.id,
          isOnSite,
          isRemote,
          remoteZones,
          informationsCommerciales,
        },
      );
      successToast("modifications enregistrées");
      await refetchOrganism();
    } catch (e) {
      graphqlErrorToast(e);
    }
  });

  const { isOnSite, isRemote } = useWatch({ control });

  return (
    <div className="flex flex-col">
      <h1>Modalités d'acompagnement</h1>
      <FormOptionalFieldsDisclaimer />
      <p>
        Renseignez les informations qui seront partagées aux candidats puis
        paramétrez vos modalités d’accompagnement (présentiel ou distanciel).
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
            <h2>Informations affichées au candidat</h2>
            <p>
              Ces informations seront affichées aux candidats dans leurs
              résultats de recherche et dans le message récapitulant leur
              candidature. Si vous ne les enregistrez pas, nous afficherons les
              informations juridiques et administrateur par défaut.
            </p>
            <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              <div>
                <Input
                  label="Nom commercial"
                  state={errors.nom ? "error" : "default"}
                  stateRelatedMessage={errors.nom?.message}
                  nativeInputProps={{ ...register("nom") }}
                />
              </div>
              <div>
                <Input
                  label="Site internet de l'établissement (optionnel)"
                  nativeInputProps={{
                    ...register("siteInternet"),
                  }}
                />
                <SmallNotice>
                  <span className="text-xs">
                    Ajouter le lien de votre établissement peut permettre à
                    celui-ci de se démarquer lorsque le candidat fera son choix.
                  </span>
                </SmallNotice>
              </div>
              <div>
                <Input
                  label="Téléphone (optionnel)"
                  nativeInputProps={{
                    ...register("telephone"),
                  }}
                />
                <SmallNotice>
                  <span className="text-xs">
                    Ce numéro de téléphone sera également envoyé aux candidats
                    dans le message récapitulant leur inscription.
                  </span>
                </SmallNotice>
              </div>
              <div>
                <Input
                  label="E-mail de contact (optionnel)"
                  state={errors.emailContact ? "error" : "default"}
                  stateRelatedMessage={errors.emailContact?.message}
                  nativeInputProps={{
                    ...register("emailContact"),
                  }}
                />
                <SmallNotice>
                  <span className="text-xs">
                    Cet e-mail sera également envoyé aux candidats dans le
                    message récapitulant leur inscription.
                  </span>
                </SmallNotice>
              </div>
            </fieldset>
            <div className="flex flex-col md:flex-row mt-8 gap-y-4">
              <fieldset className="flex flex-col md:pr-6 md:basis-1/2 flex-grow">
                <legend className="text-2xl font-bold mb-4">Présentiel</legend>
                <div className="flex flex-col">
                  {organism?.isHeadAgency && (
                    <Checkbox
                      className="col-span-2 mt-4"
                      options={[
                        {
                          label: "L'accompagnement se fait sur site",
                          nativeInputProps: { ...register("isOnSite") },
                        },
                      ]}
                    />
                  )}
                  <Input
                    label="Numéro et nom de rue"
                    disabled={!isOnSite}
                    nativeInputProps={{
                      ...register("adresseNumeroEtNomDeRue"),
                    }}
                  />
                  <Input
                    label="Informations complémentaires"
                    disabled={!isOnSite}
                    nativeInputProps={{
                      ...register("adresseInformationsComplementaires"),
                      autoComplete: "off",
                    }}
                  />
                  <Input
                    label="Code Postal"
                    disabled={!isOnSite}
                    nativeInputProps={{
                      ...register("adresseCodePostal"),
                    }}
                    state={errors.adresseCodePostal ? "error" : "default"}
                    stateRelatedMessage={errors.adresseCodePostal?.message}
                  />
                  <Input
                    label="Ville"
                    disabled={!isOnSite}
                    nativeInputProps={{
                      ...register("adresseVille"),
                    }}
                  />
                </div>

                <div className="mt-8">
                  <RadioButtons
                    disabled={!isOnSite}
                    legend="Votre établissement est-il conforme aux normes d'accessibilité et peut
            recevoir du public à mobilité réduite (PMR) ?"
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
                </div>
              </fieldset>
              {organism?.isHeadAgency && (
                <fieldset className="flex flex-col md:pl-6 md:border-l md:basis-1/2">
                  <legend className="text-2xl font-bold mb-4">
                    Distanciel
                  </legend>
                  {organism?.isHeadAgency && (
                    <Checkbox
                      className="col-span-2 mt-4"
                      options={[
                        {
                          label: "L'accompagnement se fait à distance",
                          nativeInputProps: { ...register("isRemote") },
                        },
                      ]}
                    />
                  )}
                  <Checkbox
                    disabled={!isRemote}
                    legend="Quels zones seront couvertes en distanciel ?"
                    options={[
                      {
                        label: "France métropolitaine",
                        nativeInputProps: {
                          ...register("isRemoteFranceMetropolitaine"),
                        },
                      },
                      {
                        label: "Guadeloupe",
                        nativeInputProps: {
                          ...register("isRemoteGuadeloupe"),
                        },
                      },
                      {
                        label: "Guyane",
                        nativeInputProps: {
                          ...register("isRemoteGuyane"),
                        },
                      },

                      {
                        label: "Martinique",
                        nativeInputProps: {
                          ...register("isRemoteMartinique"),
                        },
                      },
                      {
                        label: "Mayotte",
                        nativeInputProps: {
                          ...register("isRemoteMayotte"),
                        },
                      },
                      {
                        label: "La Réunion",
                        nativeInputProps: {
                          ...register("isRemoteLaReunion"),
                        },
                      },
                    ]}
                  />
                </fieldset>
              )}
            </div>
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

export default ModalitesAccompagnementPage;
