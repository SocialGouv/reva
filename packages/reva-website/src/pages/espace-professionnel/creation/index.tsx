"use client";

import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { BlueLayout } from "@/components/layout/blue-layout/BlueLayout";
import { StepOneForm } from "@/components/professional-space/creation/form/StepOneForm";
import {
  ProfessionalSpaceCreationProvider,
  useProfessionalSpaceCreationContext,
} from "@/components/professional-space/creation/context/ProfessionalSpaceCreationContext";
import { StepTwoForm } from "@/components/professional-space/creation/form/StepTwoForm";
import { StepThreeForm } from "@/components/professional-space/creation/form/StepThreeForm";
import Head from "next/head";

const PageContent = () => {
  const { currentStep } = useProfessionalSpaceCreationContext();
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

const ProfessionalSpaceCreationPage = () => {
  return (
    <MainLayout>
      <Head>
        <title>Page de création de compte professionnel</title>
      </Head>
      <BlueLayout
        title="Créer un compte professionnel"
        description="Vous êtes architecte de parcours ou certificateur, vous devez créer
        votre compte sur REVA afin de suivre et d’assurer la gestion de vos
        candidats sur leur parcours de formation"
      >
        <ProfessionalSpaceCreationProvider>
          <PageContent />
        </ProfessionalSpaceCreationProvider>
      </BlueLayout>
    </MainLayout>
  );
};

export default ProfessionalSpaceCreationPage;
