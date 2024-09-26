"use client";

import { FormOptionalFieldsDisclaimer } from "@/components/legacy/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";
import { PageLayout } from "@/layouts/page.layout";
import CallOut from "@codegouvfr/react-dsfr/CallOut";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";

export default function ChooseTypeAccompagnementPage() {
  return (
    <PageLayout title="Choix accompagnement" displayBackToHome>
      <h1 className="mt-8">Choix accompagnement</h1>
      <FormOptionalFieldsDisclaimer />
      <p>
        Vous avez la possibilité de vous faire accompagner par un professionnel
        de la VAE. Cet accompagnateur vous guidera dans les démarches
        administratives auprès du certificateur, vous guidera lors de la
        confection de votre dossier de validation et vous préparera au passage
        du jury.
      </p>
      <form className="mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <fieldset>
            <RadioButtons
              legend="Vous devez choisir d'être accompagné ou non :"
              options={[
                {
                  label: "Je souhaite être accompagnée par un AAP",
                  nativeInputProps: {
                    value: "ACCOMPAGNE",
                  },
                },
                {
                  label: "Je souhaite réaliser ma VAE en toute autonomie",
                  nativeInputProps: {
                    value: "AUTONOME",
                  },
                },
              ]}
            />
          </fieldset>
          <CallOut title="Pourquoi faire le choix de l’accompagnement ?">
            Un accompagnateur vous permet d’avoir accès à toutes les infos
            nécessaires. Le financement peut alors passer par votre CPF.
          </CallOut>
        </div>
      </form>
    </PageLayout>
  );
}
