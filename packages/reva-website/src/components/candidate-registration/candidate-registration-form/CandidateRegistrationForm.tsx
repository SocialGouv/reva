import { useState } from "react";
import { TypeAccompagnement } from "@/graphql/generated/graphql";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import Button from "@codegouvfr/react-dsfr/Button";
import { CandidateRegistrationStep1 } from "./steps/CandidateRegistrationStep1";
import { CandidateRegistrationStep2 } from "./steps/CandidateRegistrationStep2";
import { CandidateRegistrationSidebar } from "./CandidateRegistrationSidebar";
import { FormOptionalFieldsDisclaimer } from "@/components/form/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";

export interface CandidateFormData {
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  departmentId: string;
  typeAccompagnement: TypeAccompagnement;
  certificationId: string;
}

interface Props {
  certification?: {
    id: string;
    label: string;
    codeRncp: string;
    isAapAvailable: boolean;
  } | null;

  onSubmit(data: CandidateFormData): void;
}

export const CandidateRegistrationForm = ({
  certification,
  onSubmit,
}: Props) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [typeAccompagnement, setTypeAccompagnement] =
    useState<TypeAccompagnement>();

  // When the legacy version will be removed, we'll be able to remove the undefined check,
  // remove undefined from the certification type, and set a proper loading screen at the parent level.
  // For the moment, the legacy version need the undefined case to display the "no certification found" message,
  // which won't be the case anymore with this new version
  if (!certification) {
    return (
      <div className="py-10 relative">
        <h1 className="mb-12">
          Mon inscription en 2 étapes
          <FormOptionalFieldsDisclaimer />
        </h1>
      </div>
    );
  }

  const submitStep1 = (type: TypeAccompagnement) => {
    setTypeAccompagnement(type);
    setCurrentStep(2);
  };

  const submitStep2 = (
    formData: Omit<CandidateFormData, "typeAccompagnement" | "certificationId">,
  ) => {
    if (!typeAccompagnement) return;
    onSubmit({
      firstname: formData.firstname,
      lastname: formData.lastname,
      phone: formData.phone,
      email: formData.email,
      departmentId: formData.departmentId,
      typeAccompagnement,
      certificationId: certification.id,
    });
  };

  return (
    <div className="py-10 relative">
      <h1 className="mb-12">
        Mon inscription en 2 étapes
        <FormOptionalFieldsDisclaimer />
      </h1>
      <Stepper
        currentStep={currentStep}
        stepCount={2}
        title={
          currentStep === 1
            ? "VAE accompagnée ou en autonomie ?"
            : "Je crée mon compte"
        }
        nextTitle={currentStep === 1 ? "Je crée mon compte" : undefined}
      />

      {currentStep === 2 && (
        <div className="fr-text--lead py-4">
          Ces informations nous permettront de pré-remplir votre profil. Vous
          pourrez les modifier à tout moment depuis votre espace.
        </div>
      )}

      <div className="lg:flex gap-6 mt-8">
        <CandidateRegistrationSidebar
          isAapAvailable={certification.isAapAvailable}
          typeAccompagnement={typeAccompagnement}
          certification={certification}
        />
        <div className="flex-1">
          {currentStep === 1 && (
            <CandidateRegistrationStep1
              isAapAvailable={certification.isAapAvailable}
              onSubmit={submitStep1}
            />
          )}
          {currentStep === 2 && (
            <CandidateRegistrationStep2 onSubmit={submitStep2} />
          )}
        </div>
      </div>

      <div className="mt-12">
        {currentStep === 1 && (
          <Button
            data-testid="change-certification-button"
            priority="secondary"
            linkProps={{ href: `/certifications/${certification.id}` }}
          >
            Changer de diplôme
          </Button>
        )}
        {currentStep === 2 && (
          <Button
            data-testid="candidate-registration-back-button"
            priority="secondary"
            onClick={() => {
              setTypeAccompagnement(undefined);
              setCurrentStep(1);
            }}
          >
            Retour à l'étape 1
          </Button>
        )}
      </div>
    </div>
  );
};
