import { FormOptionalFieldsDisclaimer } from "@/components/form/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { useProfessionalSpaceSubscriptionContext } from "@/components/professional-space/inscription/context/ProfessionalSpaceSubscriptionContext";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";

export const CompanyDocumentsStepForm = () => {
  const { goBackToPreviousStep, submitCompanyDocumentsStep } =
    useProfessionalSpaceSubscriptionContext();

  return (
    <>
      <h1 className="mb-12">
        Étape 3 - Documents juridiques
        <FormOptionalFieldsDisclaimer />
      </h1>
      <Stepper
        title="Transmettez les différentes pièces justificatives "
        currentStep={3}
        stepCount={3}
      />
      <div className="flex gap-2 mt-4">
        <Button priority="secondary" onClick={goBackToPreviousStep}>
          Revenir à l'étape 2
        </Button>
        <Button onClick={() => submitCompanyDocumentsStep(null)}>
          Envoyer le formulaire
        </Button>
      </div>
    </>
  );
};
