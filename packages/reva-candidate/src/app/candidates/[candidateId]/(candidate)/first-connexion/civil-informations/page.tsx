"use client";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";

import { Panel } from "@/components/layout/Panel";
import { FormOptionalFieldsDisclaimer } from "@/components/legacy/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";

import { CivilInformationForm } from "../../profile/civil-informations/_components/CivilInformationForm";
import { useCivilInformation } from "../../profile/civil-informations/_components/useCivilInformation";

export default function CivilInformationsPage() {
  const { countries, departments, candidate } = useCivilInformation();

  if (!candidate || !departments || !countries) {
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
          currentStep={1}
          nextTitle="Informations de contact"
          stepCount={3}
          title="Informations civiles"
        />

        <CivilInformationForm
          hideBackButton
          hideResetButton
          submitButtonLabel="Suivant"
          submitPath="../contact-informations"
          forceIsDirty
          candidate={candidate}
          countries={countries}
          departments={departments}
        />
      </div>
    </Panel>
  );
}
