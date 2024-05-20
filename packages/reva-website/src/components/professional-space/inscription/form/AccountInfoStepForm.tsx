import { FormOptionalFieldsDisclaimer } from "@/components/form/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { useProfessionalSpaceSubscriptionContext } from "@/components/professional-space/inscription/context/ProfessionalSpaceSubscriptionContext";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";

export const AccountInfoStepForm = () => {
  const { goBackToPreviousStep, submitAccountInfoStep } =
    useProfessionalSpaceSubscriptionContext();

  return (
    <>
      <h1 className="mb-12">
        Étape 2 - Informations de l’administrateur
        <FormOptionalFieldsDisclaimer />
      </h1>
      <Stepper
        title="Ajoutez les informations de l’administrateur du compte France VAE"
        currentStep={2}
        stepCount={3}
      />
      <div className="flex gap-2 mt-4 justify-between">
        <Button priority="secondary" onClick={goBackToPreviousStep}>
          Retour
        </Button>
        <Button
          onClick={() =>
            submitAccountInfoStep({
              accountFirstname: "John",
              accountLastname: "Doe",
              accountEmail: "john.doe@example.com",
              accountPhoneNumber: "0123456789",
              delegataire: false,
            })
          }
          type="submit"
        >
          Passer à l'étape 3
        </Button>
      </div>
    </>
  );
};
