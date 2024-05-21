import { FormOptionalFieldsDisclaimer } from "@/components/form/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { CompanySummary } from "@/components/professional-space/inscription/component/CompanySummary";
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
      <div className="flex items-stretch gap-x-8">
        <CompanySummary />
        <div className="w-full flex flex-col">
          <h2>Administrateur du compte France VAE</h2>
          <p className="text-xl">
            L’administrateur du compte France VAE peut paramétrer les filières,
            les agences et les niveaux de parcours depuis son compte.{" "}
          </p>
          <div className="bg-neutral-50 h-[520px] mb-8" />
          <div className="h-full flex gap-2 items-end justify-end">
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
        </div>
      </div>
    </>
  );
};
