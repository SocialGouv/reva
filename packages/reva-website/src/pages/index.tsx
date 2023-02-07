import * as React from "react";
import { MainLayout } from "components/layout/main-layout/MainLayout";

const IndexPage = () => {
  return (
    <MainLayout>
      <div className="flex-1 flex justify-center mt-[10%] m-5">
        <h2>Bienvenue sur France VAE</h2>
      </div>
    </MainLayout>
  );
};

export default IndexPage;

export const Head = () => <title>Page d'accueil</title>;
