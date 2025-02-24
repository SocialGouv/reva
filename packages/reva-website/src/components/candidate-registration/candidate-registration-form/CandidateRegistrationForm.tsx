import { useState } from "react";

import { TypeAccompagnement } from "@/graphql/generated/graphql";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
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
  certification: {
    id: string;
    label: string;
    isAapAvailable: boolean;
  };

  onSubmit(data: CandidateFormData): void;
}

export const CandidateRegistrationForm = ({
  certification,
  onSubmit,
}: Props) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [typeAccompagnement, setTypeAccompagnement] =
    useState<TypeAccompagnement>();

  const submitStep1 = (type: TypeAccompagnement) => {
    setTypeAccompagnement(type);
    setCurrentStep(2);
  };

  const submitStep2 = (
    formData: Omit<CandidateFormData, "typeAccompagnement" | "certificationId">,
  ) => {
    if (!typeAccompagnement) return;
    onSubmit({
      ...formData,
      typeAccompagnement,
      certificationId: certification.id,
    });
  };

  return (
    <div className="py-10">
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

      <div className="flex gap-8 mt-8">
        <div className="w-64">
          <CandidateRegistrationSidebar
            typeAccompagnement={typeAccompagnement}
            certificationLabel={certification.label}
          />
        </div>
        <div className="flex-1">
          {currentStep === 1 && (
            <CandidateRegistrationStep1 onSubmit={submitStep1} />
          )}
          {currentStep === 2 && (
            <CandidateRegistrationStep2 onSubmit={submitStep2} />
          )}
        </div>
      </div>
    </div>
  );
};
