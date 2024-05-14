import { useProfessionalSpaceSubscriptionContext } from "@/components/professional-space/inscription/context/ProfessionalSpaceSubscriptionContext";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";

export const CompanySiretStepForm = () => {
  const { goBackToPreviousStep, submitCompanySiretStep } =
    useProfessionalSpaceSubscriptionContext();

  return (
    <>
      <Stepper
        title="Insérez votre numéro SIRET ainsi que les nom et prénom(s) du ou de la dirigean(e)."
        currentStep={1}
        stepCount={3}
      />
      <div className="flex gap-2 mt-4">
        <Button priority="secondary" onClick={goBackToPreviousStep}>
          Revenir à l'étape 1
        </Button>
        <Button
          onClick={() =>
            submitCompanySiretStep({
              companySiret: "12345678901234",
              companyName: "My Company",
              companyAddress: "1 rue de la Paix",
              companyZipCode: "75000",
              companyCity: "Paris",
              companyLegalStatus: "SAS",
              companyWebsite: "https://example.com",
              presidentFirstname: "John",
              presidentLastname: "Doe",
            })
          }
        >
          Passer à l'étape 2
        </Button>
      </div>
    </>
  );
};
