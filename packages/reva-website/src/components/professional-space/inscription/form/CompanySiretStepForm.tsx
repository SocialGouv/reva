import { FormOptionalFieldsDisclaimer } from "@/components/form/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { useProfessionalSpaceSubscriptionContext } from "@/components/professional-space/inscription/context/ProfessionalSpaceSubscriptionContext";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";

export const CompanySiretStepForm = () => {
  const { goBackToPreviousStep, submitCompanySiretStep } =
    useProfessionalSpaceSubscriptionContext();

  return (
    <>
      <h1 className="mb-12">
        Étape 1 : Vérification du numéro SIRET
        <FormOptionalFieldsDisclaimer />
      </h1>
      <Stepper
        title="Insérez votre numéro SIRET ainsi que les nom et prénom(s) du ou de la dirigean(e)."
        currentStep={1}
        stepCount={3}
      />
      <div className="flex gap-2 mt-4 justify-between">
        <Button priority="secondary" onClick={goBackToPreviousStep}>
          Retour
        </Button>
        <Button
          onClick={() =>
            submitCompanySiretStep({
              companySiret: "12345678901234",
              companyName: "My Company",
              companyLegalStatus: "SAS",
              companyWebsite: "https://example.com",
              managerFirstname: "John",
              managerLastname: "Doe",
            })
          }
        >
          Passer à l'étape 2
        </Button>
      </div>
    </>
  );
};
