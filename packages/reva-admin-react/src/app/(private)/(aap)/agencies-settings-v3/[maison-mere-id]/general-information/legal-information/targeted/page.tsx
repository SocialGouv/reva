"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import Image from "next/image";
import { useState } from "react";

import { SettingsPageHeader } from "@/components/settings/settings-page-header/SettingsPageHeader";
import { errorToast, graphqlErrorToast } from "@/components/toast/toast";

import {
  buildLegalInformationPayload,
  useGeneralInformationPage,
} from "../../generalInformationPage.hook";
import { LegalInformationBreadcrumb } from "../_components/LegalInformationBreadcrumb";

import { AdministratorStep } from "./_components/AdministratorStep";
import { BlockKey, BlockSelectionStep } from "./_components/BlockSelectionStep";
import { ContactStep } from "./_components/ContactStep";
import { SiretAndManagerStep } from "./_components/SiretAndManagerStep";

const STEP_TITLES = {
  identity: "Informations relatives au SIRET et à l'identité du dirigeant",
  administrator: "Administrateur du compte",
  contact: "Informations de connexion et de contact",
};

// L'enregistrement valide tous les champs, y compris ceux des blocs non
// sélectionnés: une valeur invalide déjà en base doit pouvoir être nommée à
// l'utilisateur, même si son champ n'est pas affiché à l'étape courante.
const FIELD_LABELS: Record<string, string> = {
  siret: "le numéro de SIRET",
  managerFirstname: "le prénom du dirigeant",
  managerLastname: "le nom du dirigeant",
  gestionnaireFirstname: "le prénom de l'administrateur du compte",
  gestionnaireLastname: "le nom de l'administrateur du compte",
  gestionnaireEmail: "l'adresse électronique de connexion",
  phone: "le téléphone",
};

const TargetedLegalInformationUpdatePage = () => {
  const {
    maisonMereAAP,
    maisonMereAAPId,
    etablissement,
    formHook,
    updateMaisonMereLegalInformation,
  } = useGeneralInformationPage();

  const [phase, setPhase] = useState<"selection" | "steps" | "success">(
    "selection",
  );
  const [selectedBlocks, setSelectedBlocks] = useState<BlockKey[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  // null tant que l'utilisateur n'a pas touché à la case, la valeur est alors
  // dérivée. Porté par la page: l'étape est démontée à chaque navigation.
  const [administratorIsDifferentPerson, setAdministratorIsDifferentPerson] =
    useState<boolean | null>(null);

  const {
    formState: { isSubmitting },
    handleSubmit,
    setError,
    watch,
  } = formHook;

  const [
    managerFirstname,
    managerLastname,
    gestionnaireFirstname,
    gestionnaireLastname,
  ] = watch([
    "managerFirstname",
    "managerLastname",
    "gestionnaireFirstname",
    "gestionnaireLastname",
  ]);

  const administratorIsDifferent =
    administratorIsDifferentPerson ??
    (managerFirstname !== gestionnaireFirstname ||
      managerLastname !== gestionnaireLastname);

  const isSelected = (key: BlockKey) => selectedBlocks.includes(key);

  // Les blocs "Numéro de SIRET" et "Identité du dirigeant" partagent la même étape.
  const steps = (
    [
      isSelected("siret") || isSelected("manager") ? "identity" : null,
      isSelected("administrator") ? "administrator" : null,
      isSelected("contact") ? "contact" : null,
    ] as const
  ).filter((step) => step !== null);

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const siretFieldIsVisible = isSelected("siret") && currentStep === "identity";

  const generalInformationUrl = `/agencies-settings-v3/${maisonMereAAPId}/general-information`;

  const toggleBlock = (key: BlockKey) =>
    setSelectedBlocks((blocks) =>
      blocks.includes(key)
        ? blocks.filter((block) => block !== key)
        : [...blocks, key],
    );

  const handleSave = handleSubmit(
    async (data) => {
      let payload;

      try {
        payload = buildLegalInformationPayload({
          data,
          etablissement,
          maisonMereAAPId,
          currentSiret: maisonMereAAP?.siret,
        });
      } catch (error) {
        const message = (error as Error).message;

        return siretFieldIsVisible
          ? setError("siret", { message }, { shouldFocus: true })
          : errorToast(message);
      }

      try {
        await updateMaisonMereLegalInformation(payload);
        setPhase("success");
      } catch (error) {
        graphqlErrorToast(error);
      }
    },
    (invalidFields) => {
      const labels = Object.keys(invalidFields).map(
        (field) => FIELD_LABELS[field] ?? field,
      );

      errorToast(
        `Impossible d'enregistrer : ${labels.join(", ")} ${labels.length > 1 ? "sont invalides" : "est invalide"}. Sélectionnez le bloc correspondant pour corriger.`,
      );
    },
  );

  const breadcrumb = (
    <LegalInformationBreadcrumb
      maisonMereAAPId={maisonMereAAPId}
      raisonSociale={maisonMereAAP?.raisonSociale}
    />
  );

  if (phase === "success") {
    return (
      <div className="flex flex-col md:flex-row md:items-center gap-6 w-full">
        <div className="flex flex-col flex-1">
          <h1 className="text-[40px]">
            Votre demande de mise à jour a bien été enregistrée.
          </h1>
          <p className="text-xl mb-0">
            Les modifications sont visibles dès à présent par la structure
            accompagnatrice, depuis son compte administrateur.
          </p>
          <Button
            className="mt-10 mr-auto"
            priority="secondary"
            linkProps={{ href: generalInformationUrl }}
          >
            Informations générales
          </Button>
        </div>
        <Image
          className="shrink-0"
          src="/admin2/components/success.svg"
          alt=""
          width={282}
          height={319}
        />
      </div>
    );
  }

  if (phase === "selection") {
    return (
      <div className="flex flex-col w-full">
        <SettingsPageHeader
          breadcrumb={breadcrumb}
          title="Mise à jour des informations générales"
        />
        <BlockSelectionStep
          selectedBlocks={selectedBlocks}
          onToggleBlock={toggleBlock}
          onStart={() => setPhase("steps")}
          cancelUrl={generalInformationUrl}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <SettingsPageHeader
        breadcrumb={breadcrumb}
        title="Mise à jour des informations générales"
      />
      <Stepper
        className="mt-6"
        currentStep={currentStepIndex + 1}
        stepCount={steps.length}
        title={STEP_TITLES[currentStep]}
        nextTitle={
          isLastStep ? undefined : STEP_TITLES[steps[currentStepIndex + 1]]
        }
      />
      <form
        className="flex flex-col"
        onSubmit={(e) => {
          e.preventDefault();

          if (isLastStep) {
            handleSave();
          } else {
            setCurrentStepIndex((index) => index + 1);
          }
        }}
      >
        {currentStep === "identity" && (
          <SiretAndManagerStep
            formHook={formHook}
            etablissement={etablissement}
            siretIsSelected={isSelected("siret")}
            managerIsSelected={isSelected("manager")}
          />
        )}

        {currentStep === "administrator" && (
          <AdministratorStep
            formHook={formHook}
            isDifferentPerson={administratorIsDifferent}
            onIsDifferentPersonChange={setAdministratorIsDifferentPerson}
          />
        )}

        {currentStep === "contact" && <ContactStep formHook={formHook} />}

        <div className="flex flex-wrap gap-4 mt-12">
          {currentStepIndex > 0 && (
            <Button
              type="button"
              priority="secondary"
              onClick={() => setCurrentStepIndex((index) => index - 1)}
            >
              Retour à l'étape {currentStepIndex}
            </Button>
          )}
          <Button className="ml-auto" type="submit" disabled={isSubmitting}>
            {isLastStep
              ? "Enregistrer"
              : `Passer à l'étape ${currentStepIndex + 2}`}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TargetedLegalInformationUpdatePage;
