import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import AccompagnementDemarche from "@/components/home-page/AccompagnementDemarche";
import Articles from "@/components/home-page/Articles";
import BackGroundUnions from "@/components/home-page/BackGroundUnions";
import CommentFinancerVotreParcours from "@/components/home-page/CommentFinancerVotreParcours";
import FaitesValiderVosCompetencesParUnDiplome from "@/components/home-page/FaitesValiderVosCompetencesParUnDiplome";
import QuiPeutFaireUneVAE from "@/components/home-page/QuiPeutFaireUneVAE";
import VousAvezBesoinDePlusDaide from "@/components/home-page/VousAvezBesoinDePlusDaide";
import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import Notice from "@codegouvfr/react-dsfr/Notice";
import Head from "next/head";
import { ReactNode } from "react";

const HomeContainer = ({ children }: { children: ReactNode }) => (
  <div className="w-full mx-auto relative flex flex-col items-center lg:pb-32">
    {children}
  </div>
);

const HomePage = () => {
  const { isFeatureActive, status: featureFlippingServiceStatus } =
    useFeatureflipping();

  const candidacyCreationDisabled = isFeatureActive(
    "CANDIDACY_CREATION_DISABLED",
  );

  if (featureFlippingServiceStatus === "LOADING") {
    return null;
  }
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
      <Notice
        title={
          candidacyCreationDisabled
            ? "Nous vous informons qu'il sera à nouveau possible de déposer une candidature sur la plateforme France VAE à partir du vendredi 14 Juin. Nous nous excusons pour l'interruption de notre service et vous remercions pour votre compréhension."
            : "Vous êtes sur le portail officiel du service public de la VAE. Ce portail évolue régulièrement."
        }
      />
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

export default HomePage;
