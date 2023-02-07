import * as React from "react";
import { MainLayout } from "components/layout/main-layout/MainLayout";

const ProfessionalWorkspaceCreationPage = () => {
  return (
    <MainLayout>
      <div className="flex-1 flex justify-center mt-40">
        <h2>Création</h2>
      </div>
    </MainLayout>
  );
};

export default ProfessionalWorkspaceCreationPage;

export const Head = () => (
  <title>Page de création de compte professionnel</title>
);
