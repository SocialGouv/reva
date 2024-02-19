import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import Notice from "@codegouvfr/react-dsfr/Notice";
import Head from "next/head";
import { ReactNode } from "react";

import {
  AccompagnementDemarche,
  Articles,
  BackGroundUnions,
  CommentFinancerVotreParcours,
  FaitesValiderVosCompetencesParUnDiplome,
  QuiPeutFaireUneVAE,
  VousAvezBesoinDePlusDaide,
} from "./_components";

const HomeContainer = ({ children }: { children: ReactNode }) => (
  <div className="w-full mx-auto relative flex flex-col items-center lg:pb-32">
    {children}
  </div>
);

const HomePageV2 = () => {
  return (
    <MainLayout className="relative">
      <Head>
        <title>France VAE | Bienvenue sur le portail de la VAE</title>
        <meta
          name="description"
          content="Découvrez la version beta du portail officiel du service public de la Validation des Acquis de L'Expérience."
        />
      </Head>
      <BackGroundUnions />
      <Notice title="Vous êtes sur le portail officiel du service public de la VAE. Ce portail évolue régulièrement." />
      <HomeContainer>
        <FaitesValiderVosCompetencesParUnDiplome />
        <QuiPeutFaireUneVAE />
        <VousAvezBesoinDePlusDaide />
        <AccompagnementDemarche />
        <CommentFinancerVotreParcours />
        <Articles />
      </HomeContainer>
    </MainLayout>
  );
};

export default HomePageV2;
