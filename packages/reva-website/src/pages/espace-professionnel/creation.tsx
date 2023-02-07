import * as React from "react";
import { MainLayout } from "components/layout/main-layout/MainLayout";
import { BlueLayout } from "components/layout/blue-layout/BlueLayout";

const ProfessionalWorkspaceCreationPage = () => {
  return (
    <MainLayout>
      <BlueLayout
        title="Créer un compte professionnel"
        description="Vous êtes architecte de parcours ou certificateur, vous devez créer
        votre compte sur REVA afin de suivre et d’assurer la gestion de vos
        candidats sur leur parcours de formation"
      >
        <div className="max-w-[80vw] w-[800px] h-[800px]" />
      </BlueLayout>
    </MainLayout>
  );
};

export default ProfessionalWorkspaceCreationPage;

export const Head = () => (
  <title>Page de création de compte professionnel</title>
);
