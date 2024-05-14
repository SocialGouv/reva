import { useProfessionalSpaceSubscriptionContext } from "@/components/professional-space/inscription/context/ProfessionalSpaceSubscriptionContext";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";

export const AccountInfoStepForm = () => {
  const { goBackToPreviousStep, submitAccountInfoStep } =
    useProfessionalSpaceSubscriptionContext();

  return (
    <>
      <Stepper
        title="Ajoutez les informations de l’administrateur du compte France VAE"
        currentStep={2}
        stepCount={3}
      />
      <div className="flex gap-2 mt-4">
        <Button priority="secondary" onClick={goBackToPreviousStep}>
          Revenir à l'étape 2
        </Button>
        <Button
          onClick={() =>
            submitAccountInfoStep({
              accountFirstname: "John",
              accountLastname: "Doe",
              accountEmail: "john.doe@example.com",
              accountPhoneNumber: "0123456789",
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
