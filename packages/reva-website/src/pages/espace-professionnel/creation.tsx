import * as React from "react";
import { MainLayout } from "components/layout/main-layout/MainLayout";
import { BlueLayout } from "components/layout/blue-layout/BlueLayout";
import { StepOneForm } from "components/professional-workspace/creation/form/StepOneForm";
import {
  ProfessionalWorkspaceCreationProvider,
  useProfessionalWorkspaceCreationContext,
} from "components/professional-workspace/creation/context/ProfessionalWorkspaceCreationContext";
import { StepTwoForm } from "components/professional-workspace/creation/form/StepTwoForm";
import { StepThreeForm } from "components/professional-workspace/creation/form/StepThreeForm";

const PageContent = () => {
  const { currentStep } = useProfessionalWorkspaceCreationContext();
  switch (currentStep) {
    case "stepOne":
      return <StepOneForm />;
    case "stepTwo":
      return <StepTwoForm />;
    case "stepThree":
      return <StepThreeForm />;
    default:
      return <div>unknown step</div>;
  }
};

const ProfessionalWorkspaceCreationPage = () => {
  return (
    <MainLayout>
      <BlueLayout
        title="Créer un compte professionnel"
        description="Vous êtes architecte de parcours ou certificateur, vous devez créer
        votre compte sur REVA afin de suivre et d’assurer la gestion de vos
        candidats sur leur parcours de formation"
      >
        <ProfessionalWorkspaceCreationProvider>
          <PageContent />
        </ProfessionalWorkspaceCreationProvider>
      </BlueLayout>
    </MainLayout>
  );
};

export default ProfessionalWorkspaceCreationPage;

export const Head = () => (
  <title>Page de création de compte professionnel</title>
);
