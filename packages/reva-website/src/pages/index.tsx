import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import Notice from "@codegouvfr/react-dsfr/Notice";
import Head from "next/head";
import { ReactNode } from "react";
import BackGroundUnions from "@/components/home-page/BackGroundUnions";
import { CandidateHomePageContent } from "@/components/candidate-space/CandidateHomePageContent";

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
            ? "En raison d'une mise à jour technique, le service d'inscription sera indisponible jusqu'au lundi 28 octobre."
            : "Vous êtes sur le portail officiel du service public de la VAE. Ce portail évolue régulièrement."
        }
      />

      <HomeContainer>
        <CandidateHomePageContent />
      </HomeContainer>
    </MainLayout>
  );
};

export default HomePage;
