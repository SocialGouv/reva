import * as React from "react";
import { MainLayout } from "components/layout/main-layout/MainLayout";
import { BlueLayout } from "components/layout/blue-layout/BlueLayout";
import UnionIcon from "images/union.svg";

const ProfessionalWorkspaceCreationConfirmationPage = () => {
  return (
    <MainLayout>
      <BlueLayout
        title="Créer un compte professionnel"
        description="Félicitations, vous venez de créer votre compte"
      >
        <div className="flex flex-col max-w-[50em] xl:max-w-[63.5em]">
          <UnionIcon className="self-center mb-14" />
          <p className="text-xl">
            Votre compte vient d’être créé avec succès. Vous allez recevoir un
            lien sur votre adresse email pour confirmer votre inscription
          </p>
        </div>
      </BlueLayout>
    </MainLayout>
  );
};

export default ProfessionalWorkspaceCreationConfirmationPage;

export const Head = () => (
  <title>Page de confirmation de la création de compte professionnel</title>
);
