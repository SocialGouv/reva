"use client";

import Alert from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { toDate } from "date-fns";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { FieldErrors, UseFormRegister } from "react-hook-form";

import { GrayCard } from "@/components/card/gray-card/GrayCard";
import { CompanyBadges } from "@/components/company-preview/CompanyPreview.component";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import { LegalStatus, MaisonMereAap } from "@/graphql/generated/graphql";

import { AdminToggleGestionBranch } from "./_components/AdminToggleGestionBranch";
import { AttestationReferencement } from "./_components/AttestationReferencement";
import { LegalInformationUpdateBlock } from "./_components/legal-information-update-block/LegalInformationUpdateBlock";
import { useGeneralInformationPage } from "./generalInformationPage.hook";

const GeneralInformationPage = () => {
  const router = useRouter();
  const {
    maisonMereAAP,
    maisonMereAAPId,
    maisonMereAAPSuccess,
    maisonMereAAPError,
    etablissement,
    isGestionnaireMaisonMereAAP,
    isAdmin,
    siret,
    formHook,
    handleReset,
    updateMaisonMereLegalInformation,
  } = useGeneralInformationPage();

  const {
    formState: { isSubmitting, isDirty, errors },
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
  } = formHook;

  const gestionBranchIsChecked = watch("gestionBranch");

  const setGestionBranch = (value: boolean) =>
    setValue("gestionBranch", value, { shouldDirty: true });

  const handleFormSubmit = handleSubmit(async (data) => {
    if (!etablissement) {
      return setError(
        "siret",
        {
          message:
            "Le numéro est peut-être erroné. Saisissez-le à nouveau et contactez l'AAP si cela ne fonctionne toujours pas.",
        },
        { shouldFocus: true },
      );
    }

    const {
      siret,
      managerFirstname,
      managerLastname,
      gestionnaireFirstname,
      gestionnaireLastname,
      gestionnaireEmail,
      phone,
      gestionBranch,
    } = data;
    const { formeJuridique, raisonSociale, qualiopiStatus, dateFermeture } =
      etablissement;

    if (dateFermeture) {
      return setError(
        "siret",
        {
          message: "L'établissement est fermé",
        },
        { shouldFocus: true },
      );
    }

    if (!qualiopiStatus) {
      return setError(
        "siret",
        {
          message: "L'établissement n'est pas certifié Qualiopi",
        },
        { shouldFocus: true },
      );
    }

    try {
      await updateMaisonMereLegalInformation({
        statutJuridique: formeJuridique.legalStatus as LegalStatus,
        raisonSociale,
        siret,
        maisonMereAAPId,
        managerFirstname,
        managerLastname,
        gestionnaireFirstname,
        gestionnaireLastname,
        gestionnaireEmail,
        phone,
        gestionBranch,
      });

      successToast("Les informations ont été modifiées");
      router.push(backUrl);
    } catch (error) {
      graphqlErrorToast(error);
    }
  });

  if (!maisonMereAAP || !maisonMereAAP.gestionnaire) {
    return null;
  }

  const backUrl = isAdmin
    ? `/maison-mere-aap/${maisonMereAAP?.id}`
    : "/agencies-settings-v3";

  const canDownloadAttestationReferencement =
    maisonMereAAP.statutValidationInformationsJuridiquesMaisonMereAAP ===
      "A_JOUR" &&
    !!etablissement &&
    !etablissement.dateFermeture;

  return (
    <div className="flex flex-col w-full">
      <h1>Informations générales</h1>
      <p>
        Retrouvez ici les informations renseignées lors de l'inscription. Vous
        pouvez signaler un changement au support si ces informations ne sont
        plus à jour.
      </p>
      {etablissement && (
        <AttestationReferencement
          raisonSociale={etablissement.raisonSociale}
          siret={etablissement.siret}
          canDownloadAttestationReferencement={
            canDownloadAttestationReferencement
          }
        />
      )}
      <form
        className="flex flex-col"
        onSubmit={handleFormSubmit}
        onReset={(e) => {
          e.preventDefault();
          handleReset();
        }}
      >
        {isAdmin && (
          <div className="my-3 flex gap-8">
            <Input
              label="Numéro de Siret"
              hintText="Cette modification sera effective sur le compte de l'AAP"
              nativeInputProps={register("siret")}
              className="md:w-1/4 mb-0"
            />
            {errors.siret ? (
              <Alert
                className="hidden md:block w-full "
                title="Impossible de modifier le numéro de SIRET"
                severity="error"
                description={errors.siret?.message}
              />
            ) : (
              <div className="hidden md:block w-full" />
            )}
          </div>
        )}
        {maisonMereAAPError && (
          <Alert
            className="mb-6"
            severity="error"
            title="Une erreur est survenue pendant la récupération des informations générales."
          />
        )}
        {maisonMereAAPSuccess && maisonMereAAP && (
          <div className="list-none flex flex-col gap-6 pl-0 my-1">
            <GrayCard className="min-h-[220px]">
              <h2>Informations liées au SIRET - {siret}</h2>
              {etablissement && (
                <>
                  <CompanyBadges
                    className="col-span-3 mb-4"
                    siegeSocial={etablissement.siegeSocial}
                    dateFermeture={
                      etablissement.dateFermeture
                        ? toDate(etablissement.dateFermeture)
                        : null
                    }
                    qualiopiStatus={!!etablissement.qualiopiStatus}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <Info title="Raison sociale">
                      {etablissement.raisonSociale}
                    </Info>
                    <Info title="Forme juridique">
                      {etablissement.formeJuridique.libelle}
                    </Info>
                  </div>
                </>
              )}
            </GrayCard>
            <GrayCard>
              <h2>Dirigeant et administrateur du compte</h2>
              {isAdmin ? (
                <AccountInfoForm register={register} errors={errors} />
              ) : (
                <AccountInfo maisonMereAAP={maisonMereAAP} />
              )}
            </GrayCard>
            {(isGestionnaireMaisonMereAAP || isAdmin) && (
              <LegalInformationUpdateBlock
                onUpdateButtonClick={() =>
                  router.push(
                    `/agencies-settings-v3/${maisonMereAAP.id}/general-information/legal-information-update`,
                  )
                }
                statutValidationInformationsJuridiquesMaisonMereAAP={
                  maisonMereAAP.statutValidationInformationsJuridiquesMaisonMereAAP
                }
                decisions={maisonMereAAP.legalInformationDocumentsDecisions.map(
                  (d) => ({
                    ...d,
                    decisionTakenAt: toDate(d.decisionTakenAt),
                  }),
                )}
              />
            )}
            {isAdmin && (
              <AdminToggleGestionBranch
                gestionBranchIsChecked={gestionBranchIsChecked}
                setGestionBranch={setGestionBranch}
              />
            )}
          </div>
        )}
        {isAdmin ? (
          <FormButtons
            className="col-span-2"
            formState={{ isSubmitting, isDirty }}
            backUrl={backUrl}
          />
        ) : (
          <Button
            className="mt-12"
            priority="tertiary"
            linkProps={{
              href: backUrl,
            }}
          >
            Retour
          </Button>
        )}
      </form>
    </div>
  );
};

export default GeneralInformationPage;

const Info = ({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) => (
  <dl className={`m-2 ${className || ""}`}>
    <dt className="mb-1">{title}</dt>
    <dd className="font-medium">{children}</dd>
  </dl>
);

const AccountInfo = ({ maisonMereAAP }: { maisonMereAAP: MaisonMereAap }) => (
  <div className="grid grid-cols-1 md:grid-cols-2">
    <Info title="Dirigeant(e)">
      {maisonMereAAP.managerFirstname} {maisonMereAAP.managerLastname}
    </Info>
    <Info title="Administrateur">
      {maisonMereAAP.gestionnaire.firstname}{" "}
      {maisonMereAAP.gestionnaire.lastname}
    </Info>
    <Info title="Adresse électronique">{maisonMereAAP.gestionnaire.email}</Info>
    <Info title="Téléphone">{maisonMereAAP.phone}</Info>
  </div>
);

const AccountInfoForm = ({
  register,
  errors,
}: {
  register: UseFormRegister<{
    managerFirstname: string;
    managerLastname: string;
    gestionnaireFirstname: string;
    gestionnaireLastname: string;
    gestionnaireEmail: string;
    siret: string;
    phone: string;
    gestionBranch: boolean;
  }>;
  errors: FieldErrors<{
    managerFirstname: string;
    managerLastname: string;
    gestionnaireFirstname: string;
    gestionnaireLastname: string;
    gestionnaireEmail: string;
    siret: string;
    phone: string;
    gestionBranch: boolean;
  }>;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input
      label="Prénom du dirigeant(e)"
      nativeInputProps={register("managerFirstname")}
      state={errors.managerFirstname ? "error" : "default"}
      stateRelatedMessage={errors.managerFirstname?.message}
    />
    <Input
      label="Nom du dirigeant(e)"
      nativeInputProps={register("managerLastname")}
      state={errors.managerLastname ? "error" : "default"}
      stateRelatedMessage={errors.managerLastname?.message}
    />
    <Input
      label="Prénom du gestionnaire"
      nativeInputProps={register("gestionnaireFirstname")}
      state={errors.gestionnaireFirstname ? "error" : "default"}
      stateRelatedMessage={errors.gestionnaireFirstname?.message}
    />
    <Input
      label="Nom du gestionnaire"
      nativeInputProps={register("gestionnaireLastname")}
      state={errors.gestionnaireLastname ? "error" : "default"}
      stateRelatedMessage={errors.gestionnaireLastname?.message}
    />
    <Input
      label="Adresse électronique du gestionnaire"
      nativeInputProps={register("gestionnaireEmail")}
      state={errors.gestionnaireEmail ? "error" : "default"}
      stateRelatedMessage={errors.gestionnaireEmail?.message}
    />
    <Input
      label="Téléphone"
      nativeInputProps={register("phone")}
      state={errors.phone ? "error" : "default"}
      stateRelatedMessage={errors.phone?.message}
    />
  </div>
);
