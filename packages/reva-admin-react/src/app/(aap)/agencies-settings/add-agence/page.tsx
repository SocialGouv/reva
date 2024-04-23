"use client";

import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { errorToast, graphqlErrorToast } from "@/components/toast/toast";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FormProvider, useController, useForm } from "react-hook-form";
import { AgenceFormData, agenceFormSchema } from "./agenceFormSchema";
import { useAgencePage } from "./addAgencePage.hook";
import { ZoneIntervention } from "@/app/(aap)/agencies-settings/_components/zone-intervention/ZoneIntervention";
import { useZoneInterventionAAP } from "@/app/(aap)/agencies-settings/_components/zone-intervention/zoneInterventionAAP.hook";

const modalCreateAgence = createModal({
  id: "modal-create-agence",
  isOpenedByDefault: false,
});

const AddAgencePage = () => {
  const [isSubmittingModal, setIsSubmittingModal] = useState(false);
  const modalCreateAgenceIsOpen = useIsModalOpen(modalCreateAgence);
  const router = useRouter();

  const { createOrganismByMaisonMereAAP, maisonMereAAPOnDepartements } =
    useAgencePage();

  const { getZonesIntervention, mergeZonesIntervention } =
    useZoneInterventionAAP();

  const zonesInterventionMaisonMereAAP = useMemo(
    () =>
      getZonesIntervention({
        maisonMereAAPOnDepartements: maisonMereAAPOnDepartements,
      }),
    [getZonesIntervention, maisonMereAAPOnDepartements],
  );

  const methods = useForm<AgenceFormData>({
    resolver: zodResolver(agenceFormSchema),
    defaultValues: {
      zoneInterventionDistanciel: zonesInterventionMaisonMereAAP.remote,
      zoneInterventionPresentiel: zonesInterventionMaisonMereAAP.onSite,
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    control,
  } = methods;

  const onSiteInterventionZoneController = useController({
    name: "zoneInterventionPresentiel",
    control,
  });

  const remoteInterventionZoneController = useController({
    name: "zoneInterventionDistanciel",
    control,
  });

  const handleFormSubmit = handleSubmit(async (data) => {
    const departmentsWithOrganismMethod = mergeZonesIntervention({
      onSiteZone: data.zoneInterventionPresentiel,
      remoteZone: data.zoneInterventionDistanciel,
    });

    if (!departmentsWithOrganismMethod.length) {
      errorToast("Veuillez sélectionner au moins un département");
      return;
    }
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
      departmentsWithOrganismMethods: departmentsWithOrganismMethod,
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
    };

    try {
      await createOrganismByMaisonMereAAP.mutateAsync(organismData);
      modalCreateAgence.open();
      setTimeout(() => setIsSubmittingModal(true), 500);
    } catch (e) {
      graphqlErrorToast(e);
    }
  });

  const handleReset = useCallback(() => {
    reset({
      zoneInterventionDistanciel: zonesInterventionMaisonMereAAP.remote,
      zoneInterventionPresentiel: zonesInterventionMaisonMereAAP.onSite,
    });
  }, [reset, zonesInterventionMaisonMereAAP]);

  useEffect(() => {
    handleReset();
  }, [handleReset]);

  useEffect(() => {
    if (isSubmittingModal && !modalCreateAgenceIsOpen) {
      router.push("/agencies-settings");
    }
  }, [isSubmittingModal, modalCreateAgenceIsOpen, router]);

  return (
    <>
      <div className="w-full flex flex-col items-center justify-center p-8">
        <FormProvider {...methods}>
          <form
            onSubmit={handleFormSubmit}
            onReset={(e) => {
              e.preventDefault();
              handleReset();
            }}
          >
            <div className="flex flex-col gap-16 mb-6">
              <fieldset className="flex flex-col gap-4 w-full">
                <legend className="text-2xl font-bold mb-4">
                  Adresse de l'agence
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  <Input
                    className="!mb-4"
                    label="Numéro et nom de rue"
                    nativeInputProps={{
                      ...register("adresseNumeroEtNomDeRue"),
                    }}
                    state={errors.adresseNumeroEtNomDeRue ? "error" : "default"}
                    stateRelatedMessage={errors.adresseNumeroEtNomDeRue?.message?.toString()}
                  />

                  <Input
                    className="!mb-4"
                    label="Informations complémentaires (optionnel)"
                    nativeInputProps={{
                      ...register("adresseInformationsComplementaires"),
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
              </fieldset>

              <fieldset className="flex flex-col gap-4">
                <legend className="text-2xl font-bold mb-4">
                  Informations commerciales de l'agence affichées aux candidats
                </legend>
                <Alert
                  severity="info"
                  className="mb-4"
                  title=""
                  description="Les informations suivantes seront affichées aux candidats dans les résultats de recherche d'un AAP et dans le message récapitulant leur candidature. "
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <Input
                      className="!mb-4"
                      label="Nom commercial"
                      nativeInputProps={{ ...register("nom") }}
                      state={errors.nom ? "error" : "default"}
                      stateRelatedMessage={errors.nom?.message?.toString()}
                    />
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
                      dans le message récapitulant leur inscription.
                    </SmallNotice>
                  </div>

                  <div>
                    <Input
                      className="!mb-4"
                      label="Site internet de l'établissement (optionnel)"
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
                      label="E-mail de contact"
                      nativeInputProps={{ ...register("emailContact") }}
                      state={errors.emailContact ? "error" : "default"}
                      stateRelatedMessage={errors.emailContact?.message?.toString()}
                    />
                    <SmallNotice>
                      Cet e-mail sera également envoyé aux candidats dans le
                      message récapitulant leur inscription.
                    </SmallNotice>
                  </div>
                </div>
              </fieldset>

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
                    {
                      label: "Cet établissement ne reçoit pas de public",
                      nativeInputProps: {
                        value: "ETABLISSEMENT_NE_RECOIT_PAS_DE_PUBLIC",
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

              <div className="w-full">
                <fieldset>
                  <legend className="text-2xl font-bold mb-4">
                    Zone d'intervention
                  </legend>
                  <div className="flex flex-col sm:flex-row gap-y-8 sm:gap-x-8">
                    <ZoneIntervention
                      type="ON_SITE"
                      zoneIntervention={
                        onSiteInterventionZoneController.field.value
                      }
                      onChange={onSiteInterventionZoneController.field.onChange}
                    />
                    <ZoneIntervention
                      type="REMOTE"
                      zoneIntervention={
                        remoteInterventionZoneController.field.value
                      }
                      onChange={remoteInterventionZoneController.field.onChange}
                    />
                  </div>
                </fieldset>
              </div>

              <fieldset className="flex flex-col gap-4 w-full">
                <legend className="text-2xl font-bold mb-4">
                  Informations du responsable d'agence
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  <Input
                    label="Nom"
                    state={errors.lastname ? "error" : "default"}
                    stateRelatedMessage={errors.lastname?.message?.toString()}
                    nativeInputProps={{
                      ...register("lastname"),
                      autoComplete: "family-name",
                    }}
                  />
                  <Input
                    label="Prénom"
                    state={errors.firstname ? "error" : "default"}
                    stateRelatedMessage={errors.firstname?.message?.toString()}
                    nativeInputProps={{
                      ...register("firstname"),
                      autoComplete: "given-name",
                    }}
                  />
                  <div>
                    <Input
                      label="Adresse email"
                      state={errors.email ? "error" : "default"}
                      stateRelatedMessage={errors.email?.message?.toString()}
                      nativeInputProps={{
                        ...register("email"),
                        autoComplete: "email",
                        type: "email",
                        spellCheck: "false",
                      }}
                    />
                    <SmallNotice>
                      Le responsable d'agence recevra la confirmation pour la
                      validation du compte sur cet email. Il lui sera également
                      nécessaire pour se connecter à la plateforme.
                    </SmallNotice>
                  </div>
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
      <modalCreateAgence.Component
        title={
          <>
            <span className="fr-icon-check-line fr-icon--lg mr-2"></span>
            Votre demande de création d'agence a bien été validée
          </>
        }
        size="large"
      >
        <div className="flex flex-col gap-4">
          <div>
            <p>
              Un mail va être adressé au responsable d'agence, à l'adresse
              saisie en fin de formulaire. Il contient un lien d'activation qui
              sera valable 4 jours.
            </p>
            <p>
              Après avoir défini un mot de passe, l'agence pourra accéder à son
              propre espace professionnel. Seules les nouvelles candidatures qui
              auront sélectionné votre agence arriveront dans son espace. Les
              candidatures déjà reçues et en cours de traitement ne pourront lui
              être transférées.
            </p>
            <p>
              En cas de question, vous pouvez nous contacter à l'adresse mail
              suivante:{" "}
              <Link href="mailto:support@vae.gouv.fr">support@vae.gouv.fr</Link>
            </p>
          </div>
          <Alert
            severity="info"
            title=""
            description={
              <span>
                Afin de vous assurer que vous recevez bien nos e-mails,{" "}
                <b>
                  pensez à vérifier votre dossier de courrier indésirable ou
                  votre outil de filtre de spams
                </b>{" "}
                si votre structure en utilise un (ex: Mail in Black).
              </span>
            }
          />
          <Button className="self-center" onClick={modalCreateAgence.close}>
            C'est compris !
          </Button>
        </div>
      </modalCreateAgence.Component>
    </>
  );
};

export default AddAgencePage;
