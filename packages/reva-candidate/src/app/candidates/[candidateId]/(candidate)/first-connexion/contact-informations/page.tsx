"use client";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";

import { Panel } from "@/components/layout/Panel";
import { FormOptionalFieldsDisclaimer } from "@/components/legacy/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";

import { ContactInformationForm } from "../../profile/contact-informations/_components/ContactInformationForm";
import { useContactInformations } from "../../profile/contact-informations/_components/useContactInformations";

export default function ContactInformationsPage() {
  const { countries, departments, candidate } = useContactInformations();

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
          currentStep={2}
          nextTitle="Typologie et convention collective"
          stepCount={3}
          title="Informations civiles"
        />

        <ContactInformationForm
          backButtonLabel="Précédent"
          backButtonUrl="../civil-informations"
          hideResetButton
          submitButtonLabel="Suivant"
          submitPath="../typology-and-collective-agreement"
          forceIsDirty
          candidate={candidate}
          countries={countries}
          departments={departments}
        />
      </div>
    </Panel>
  );
}
