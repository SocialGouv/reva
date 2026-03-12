"use client";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";

import { Panel } from "@/components/layout/Panel";
import { FormOptionalFieldsDisclaimer } from "@/components/legacy/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";

import { TypologyAndCollectiveAgreementForm } from "../../profile/typology-and-collective-agreement/_components/TypologyAndCollectiveAgreementForm";
import { useTypologyAndCollectiveAgreement } from "../../profile/typology-and-collective-agreement/_components/useTypologyAndCollectiveAgreement";

export default function TypologyAndCollectiveAgreementPage() {
  const { candidate } = useTypologyAndCollectiveAgreement();

  if (!candidate) {
    return null;
  }

  return (
    <Panel>
      <div className="flex flex-col w-full">
        <h1 className="mb-0">Mon profil</h1>

        <FormOptionalFieldsDisclaimer className="mb-6" />

        <p className="mb-12 text-xl">
          Vérifiez et complétez vos informations de profil qui seront utilisées
          pour vous identifier et vous contacter pendant tout votre parcours de
          VAE.
        </p>

        <Stepper
          className="mb-12"
          currentStep={3}
          stepCount={3}
          title="Typologie et convention collective"
        />

        <TypologyAndCollectiveAgreementForm
          backButtonUrl="../contact-informations"
          backButtonLabel="Précédent"
          hideResetButton
          submitButtonLabel="Enregistrer"
          submitPath="../../"
          forceIsDirty
          candidate={candidate}
        />
      </div>
    </Panel>
  );
}
