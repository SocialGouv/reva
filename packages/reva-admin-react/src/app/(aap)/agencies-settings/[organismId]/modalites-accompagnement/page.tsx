"use client";
import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { successToast } from "@/components/toast/toast";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo } from "react";
import { useController, useForm } from "react-hook-form";
import * as z from "zod";
import { useModalitesAccompagnementPage } from "./modalitesAccompagnement.hook";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { ZoneIntervention } from "../../_components/zone-intervention/ZoneIntervention";
import { useZoneInterventionAAP } from "../../_components/zone-intervention/zoneInterventionAAP.hook";

const schema = z.object({
  nom: z.string().optional().default(""),
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
  adresseNumeroEtNomDeRue: z.string().optional().default(""),
  adresseInformationsComplementaires: z.string().optional().default(""),
  adresseCodePostal: z
    .string()
    .regex(/^(\d{5}|)$/, "Ce champ doit être vide ou contenir un code postal"),
  adresseVille: z.string().optional().default(""),
  conformeNormesAccessbilite: z
    .enum(["CONFORME", "NON_CONFORME", "ETABLISSEMENT_NE_RECOIT_PAS_DE_PUBLIC"])
    .nullable(),
  zoneInterventionDistanciel: z
    .array(
      z
        .object({
          id: z.string(),
          label: z.string(),
          selected: z.boolean(),
          children: z
            .array(
              z.object({
                id: z.string(),
                label: z.string(),
                selected: z.boolean(),
              }),
            )
            .default([]),
        })
        .default({
          id: "",
          label: "",
          selected: false,
          children: [],
        }),
    )
    .default([]),
});

type FormData = z.infer<typeof schema>;

const ModalitesAccompagnementPage = () => {
  const {
    organism,
    maisonMereAAP,
    getOrganismStatus,
    refetchOrganism,
    createOrUpdateInformationsCommercialesAndInterventionZone,
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

  const { getZonesIntervention, mergeZonesIntervention } =
    useZoneInterventionAAP();

  const zonesIntervention = useMemo(
    () =>
      getZonesIntervention({
        maisonMereAAPOnDepartements:
          maisonMereAAP?.maisonMereAAPOnDepartements || [],
        organismOnDepartments: organism?.organismOnDepartments || [],
      }),
    [
      getZonesIntervention,
      maisonMereAAP?.maisonMereAAPOnDepartements,
      organism?.organismOnDepartments,
    ],
  );

  const remoteInterventionZoneController = useController({
    name: "zoneInterventionDistanciel",
    control,
  });

  const handleReset = useCallback(() => {
    reset({
      zoneInterventionDistanciel: zonesIntervention.remote,
    });
  }, [reset, zonesIntervention]);

  useEffect(
    () =>
      reset({
        ...organism?.informationsCommerciales,
        zoneInterventionDistanciel: zonesIntervention.remote,
      } as FormData),
    [organism, reset, zonesIntervention.remote],
  );

  const handleFormSubmit = handleSubmit(async (data) => {
    const { zoneInterventionDistanciel, ...informationsCommerciales } = data;
    await createOrUpdateInformationsCommercialesAndInterventionZone.mutateAsync(
      {
        organismId: organism?.id,
        informationsCommerciales,
        interventionZone: mergeZonesIntervention({
          onSiteZone: [],
          remoteZone: zoneInterventionDistanciel,
        }),
      },
    );
    successToast("modifications enregistrées");
    await refetchOrganism();
  });

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
              reset({
                ...organism?.informationsCommerciales,
                zoneInterventionDistanciel: zonesIntervention.remote,
              } as FormData);
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
                  hintText="(optionnel)"
                  nativeInputProps={{ ...register("nom") }}
                />
                <SmallNotice>
                  <span className="text-xs">
                    Si vous ne renseignez pas ce champ, votre raison sociale
                    sera affichée aux candidats par défaut.
                  </span>
                </SmallNotice>
              </div>
              <div>
                <Input
                  label="Site internet de l'établissement"
                  hintText="(optionnel)"
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
                  label="Téléphone"
                  hintText="(optionnel)"
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
                  label="E-mail de contact"
                  hintText="(optionnel)"
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
            <div className="grid grid-cols-1 md:grid-cols-2 mt-8 gap-y-4">
              <fieldset className="flex flex-col md:pr-6">
                <legend className="text-2xl font-bold mb-4">Présentiel</legend>
                <div className="flex flex-col">
                  <Input
                    label="Numéro et nom de rue"
                    nativeInputProps={{
                      ...register("adresseNumeroEtNomDeRue"),
                    }}
                  />
                  <Input
                    label="Informations complémentaires"
                    nativeInputProps={{
                      ...register("adresseInformationsComplementaires"),
                    }}
                  />
                  <Input
                    label="Code Postal"
                    nativeInputProps={{
                      ...register("adresseCodePostal"),
                    }}
                    state={errors.adresseCodePostal ? "error" : "default"}
                    stateRelatedMessage={errors.adresseCodePostal?.message}
                  />
                  <Input
                    label="Ville"
                    nativeInputProps={{
                      ...register("adresseVille"),
                    }}
                  />
                </div>

                <div className="mt-8">
                  <RadioButtons
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
              <fieldset className="flex flex-col md:pl-6 md:border-l">
                <legend className="text-2xl font-bold mb-4">Distanciel</legend>
                <ZoneIntervention
                  type="REMOTE"
                  zoneIntervention={
                    remoteInterventionZoneController.field.value
                  }
                  onChange={remoteInterventionZoneController.field.onChange}
                />
              </fieldset>
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
