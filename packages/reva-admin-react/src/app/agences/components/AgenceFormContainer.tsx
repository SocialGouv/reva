import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { errorToast, successToast } from "@/components/toast/toast";
import {
  CreateOrUpdateOrganismWithMaisonMereAapInput,
  Organism,
} from "@/graphql/generated/graphql";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useAgencesQueries } from "../agencesQueries";
import { AgenceFormData, agenceFormSchema } from "./agenceFormSchema";
import ZoneIntervention from "./zone-intervention/ZoneIntervention";
import {
  ZoneInterventionList,
  useDepartementsOnRegions,
} from "./zone-intervention/useDepartementsOnRegions";

const modalCreateAgence = createModal({
  id: "modal-create-agence",
  isOpenedByDefault: false,
});

interface AgenceFormContainerProps {
  onSubmitFormMutation: (
    data: CreateOrUpdateOrganismWithMaisonMereAapInput,
  ) => Promise<void>;
  buttonValidateText: string;
}

function AgenceFormContainer({
  onSubmitFormMutation,
  buttonValidateText,
}: AgenceFormContainerProps) {
  const { agence_id } = useParams();
  const { organismsRefetch, organisms } = useAgencesQueries();
  const [isSubmittingModal, setIsSubmittingModal] = useState(false);
  const modalCreateAgenceIsOpen = useIsModalOpen(modalCreateAgence);
  const router = useRouter();

  const methods = useForm<AgenceFormData>({
    resolver: zodResolver(agenceFormSchema),
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = methods;

  const agenceSelected = organisms?.find(
    (organism) => organism.id === agence_id,
  );

  const {
    organismOndepartementsOnRegionsRemote,
    organismOndepartementsOnRegionsOnSite,
  } = useDepartementsOnRegions({
    zoneInterventionDistanciel: watch(
      "zoneInterventionDistanciel",
    ) as ZoneInterventionList,
    zoneInterventionPresentiel: watch(
      "zoneInterventionPresentiel",
    ) as ZoneInterventionList,
    setValue,
    agenceSelected: agenceSelected as Partial<Organism>,
  });

  const handleFormSubmit = handleSubmit(async (data) => {
    const zoneInterventionPresentiel = data.zoneInterventionPresentiel;
    const zoneInterventionDistanciel = data.zoneInterventionDistanciel;

    const departmentsWithOrganismMethodUnfiltered: Record<
      string,
      { isOnSite: boolean; isRemote: boolean }
    > = {};

    if (zoneInterventionPresentiel) {
      zoneInterventionPresentiel.forEach((region) => {
        region.departements.forEach((departement) => {
          if (departement.isSelected) {
            if (
              !departmentsWithOrganismMethodUnfiltered[
                departement.departementId
              ]
            ) {
              departmentsWithOrganismMethodUnfiltered[
                departement.departementId
              ] = {
                isOnSite: true,
                isRemote: false,
              };
            } else {
              departmentsWithOrganismMethodUnfiltered[
                departement.departementId
              ].isOnSite = true;
            }
          }
        });
      });
    }

    if (zoneInterventionDistanciel) {
      zoneInterventionDistanciel.forEach((region) => {
        region.departements.forEach((departement) => {
          if (departement.isSelected) {
            if (
              !departmentsWithOrganismMethodUnfiltered[
                departement.departementId
              ]
            ) {
              departmentsWithOrganismMethodUnfiltered[
                departement.departementId
              ] = {
                isOnSite: false,
                isRemote: true,
              };
            } else {
              departmentsWithOrganismMethodUnfiltered[
                departement.departementId
              ].isRemote = true;
            }
          }
        });
      });
    }

    const departmentsWithOrganismMethod = Object.entries(
      departmentsWithOrganismMethodUnfiltered,
    )
      .filter(([, { isOnSite, isRemote }]) => isOnSite || isRemote)
      .map(([departmentId, { isOnSite, isRemote }]) => ({
        departmentId,
        isOnSite,
        isRemote,
      }));

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
      accountId: agenceSelected?.organismOnAccount?.id,
    };

    try {
      await onSubmitFormMutation(organismData);
      await organismsRefetch();
      if (agenceSelected) {
        successToast("Les modifications ont bien été enregistrées");
        return router.push("/agences");
      }
      modalCreateAgence.open();
      setTimeout(() => setIsSubmittingModal(true), 500);
    } catch (error) {
      errorToast("Une erreur est survenue");
    }
  });

  const handleReset = useCallback(() => {
    reset({
      adresseNumeroEtNomDeRue:
        agenceSelected?.informationsCommerciales?.adresseNumeroEtNomDeRue ?? "",
      adresseInformationsComplementaires:
        agenceSelected?.informationsCommerciales
          ?.adresseInformationsComplementaires ?? "",
      adresseCodePostal:
        agenceSelected?.informationsCommerciales?.adresseCodePostal ?? "",
      adresseVille:
        agenceSelected?.informationsCommerciales?.adresseVille ?? "",
      nom: agenceSelected?.informationsCommerciales?.nom ?? "",
      telephone: agenceSelected?.informationsCommerciales?.telephone ?? "",
      siteInternet:
        agenceSelected?.informationsCommerciales?.siteInternet ?? "",
      emailContact:
        agenceSelected?.informationsCommerciales?.emailContact ?? "",
      conformeNormesAccessbilite:
        agenceSelected?.informationsCommerciales?.conformeNormesAccessbilite ??
        undefined,
      zoneInterventionPresentiel: organismOndepartementsOnRegionsOnSite ?? [],
      zoneInterventionDistanciel: organismOndepartementsOnRegionsRemote ?? [],
      email: agenceSelected?.organismOnAccount?.email ?? "",
      firstname: agenceSelected?.organismOnAccount?.firstname ?? "",
      lastname: agenceSelected?.organismOnAccount?.lastname ?? "",
    });
  }, [
    agenceSelected,
    organismOndepartementsOnRegionsOnSite,
    organismOndepartementsOnRegionsRemote,
    reset,
  ]);

  useEffect(() => {
    if (agenceSelected) {
      handleReset();
    }
  }, [agenceSelected, reset, handleReset]);

  useEffect(() => {
    if (isSubmittingModal && !modalCreateAgenceIsOpen) {
      router.push("/agences");
    }
  }, [isSubmittingModal, modalCreateAgenceIsOpen, router]);

  return (
    <>
      <div className="w-full flex flex-col items-center justify-center p-8">
        {agenceSelected && (
          <h3 className="text-3xl font-bold mb-8 self-start">
            {agenceSelected.informationsCommerciales?.nom
              ? agenceSelected.informationsCommerciales.nom
              : agenceSelected.label}
          </h3>
        )}
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
                    stateRelatedMessage={
                      errors.adresseNumeroEtNomDeRue?.message
                    }
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
                      stateRelatedMessage={errors.nom?.message}
                    />
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
                      stateRelatedMessage={errors.siteInternet?.message}
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
                      stateRelatedMessage={errors.emailContact?.message}
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
                <ZoneIntervention />
              </div>

              <fieldset className="flex flex-col gap-4 w-full">
                <legend className="text-2xl font-bold mb-4">
                  Informations du responsable d'agence
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  <Input
                    label="Nom"
                    state={errors.lastname ? "error" : "default"}
                    stateRelatedMessage={errors.lastname?.message}
                    nativeInputProps={{
                      ...register("lastname"),
                      autoComplete: "family-name",
                    }}
                  />
                  <Input
                    label="Prénom"
                    state={errors.firstname ? "error" : "default"}
                    stateRelatedMessage={errors.firstname?.message}
                    nativeInputProps={{
                      ...register("firstname"),
                      autoComplete: "given-name",
                    }}
                  />
                  <div>
                    <Input
                      label="Adresse email"
                      state={errors.email ? "error" : "default"}
                      stateRelatedMessage={errors.email?.message}
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
                <Button disabled={isSubmitting}>{buttonValidateText}</Button>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
      <modalCreateAgence.Component title="" size="large">
        <div className="flex flex-col gap-4">
          <div className="self-center text-2xl">✔️</div>
          <p>Votre demande de création d'agence a bien été validée.</p>
          <p>
            Un mail va être adressé à l'adresse mail renseignée dans le champ
            adresse mail du responsable d'agence. Il contient un lien
            d'activation qui sera valable 4 jours.
          </p>
          <p>
            Après avoir défini votre mot de passe, vous pourrez accéder à
            l'espace professionnel de votre agence. Notez bien qu'il n'y aura
            pas de reprise concernant les candidatures déjà en cours, seules les
            nouvelles candidatures qui auront sélectionnées votre agence
            arriveront dans son espace.
          </p>
          <p>
            En cas de question, vous pouvez contacter :{" "}
            <Link href="mailto:support@vae.gouv.fr">support@vae.gouv.fr</Link>
          </p>
          <Alert
            severity="info"
            title=""
            description={
              <span>
                Afin de vous assurer que vous recevez bien nos e-mails,{" "}
                <b>
                  pensez à vérifier votre dossier de courrier indésirable ou
                  votre outil de filtra de spams
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
}

export default AgenceFormContainer;
